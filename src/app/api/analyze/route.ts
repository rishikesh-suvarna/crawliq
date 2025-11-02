// app/api/analyze/route.ts
import { auditUrl } from '@/lib/audit';
import { auditKey } from '@/lib/cacheKey';
import { q } from '@/lib/db';
import { allowedByRobots, fetchHTML } from '@/lib/fetchPage';
import { NextRequest, NextResponse } from 'next/server';
import { getRag } from '../_core/rag';

// TTLs
const HTML_TTL_HOURS = 6;
const PSI_TTL_HOURS = 48;
const PSI_ON = !!process.env.GOOGLE_PSI_KEY;

// usage caps
const DAILY_CAP = 10;

export const runtime = 'nodejs';

// ---------- usage cap ----------
async function enforceDailyCap(req: NextRequest) {
  const userKey = getUserKey(req);
  const day = new Date().toISOString().slice(0, 10);
  const rows = await q<{ count: number }>(
    `insert into crawliq_usage(user_key, day, count)
     values ($1, $2, 0)
     on conflict (user_key, day) do update set user_key=excluded.user_key
     returning count`,
    [userKey, day]
  );
  const [{ count }] = rows;
  if (count >= DAILY_CAP) throw new Error('Daily limit reached');
  await q(
    `update crawliq_usage set count = count + 1 where user_key=$1 and day=$2`,
    [userKey, day]
  );
}

function getUserKey(req: NextRequest) {
  const hdr = req.headers.get('x-user-id') || req.cookies.get('uid')?.value;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return hdr || ip || 'anon';
}

// ---------- cache helpers ----------
async function getCache(auditHash: string) {
  const [row] = await q<any>(
    `select *
       from crawliq_audits
      where audit_hash=$1
      limit 1`,
    [auditHash]
  );
  return row || null;
}

async function putCache({
  auditHash,
  urlRaw,
  urlNorm,
  report,
  etag,
  lastModified,
  contentHash,
}: {
  auditHash: string;
  urlRaw: string;
  urlNorm: string;
  report: any;
  etag?: string | null;
  lastModified?: string | null;
  contentHash?: string | null;
}) {
  const htmlExpiresAt = new Date(
    Date.now() + HTML_TTL_HOURS * 3600 * 1000
  ).toISOString();
  const psiExpiresAt = new Date(
    Date.now() + PSI_TTL_HOURS * 3600 * 1000
  ).toISOString();
  await q(
    `insert into crawliq_audits
       (url, url_norm, audit_hash, report_json, status_code, http_etag, last_modified, content_hash, html_expires_at, psi_expires_at, refreshed_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now())
     on conflict (audit_hash) do update set
       report_json=excluded.report_json,
       status_code=excluded.status_code,
       http_etag=coalesce(excluded.http_etag, crawliq_audits.http_etag),
       last_modified=coalesce(excluded.last_modified, crawliq_audits.last_modified),
       content_hash=coalesce(excluded.content_hash, crawliq_audits.content_hash),
       html_expires_at=excluded.html_expires_at,
       psi_expires_at=excluded.psi_expires_at,
       refreshed_at=now()`,
    [
      urlRaw,
      urlNorm,
      auditHash,
      report,
      report?.status ?? 200,
      etag ?? null,
      lastModified ?? null,
      contentHash ?? null,
      htmlExpiresAt,
      report.psi ? psiExpiresAt : null,
    ]
  );
}

function isFresh(timestamp?: string | null) {
  if (!timestamp) return false;
  return new Date(timestamp) > new Date();
}

// ---------- route ----------
export async function POST(req: NextRequest) {
  try {
    await enforceDailyCap(req);

    const body = await req.json();
    const url = body?.url;
    if (!url)
      return NextResponse.json({ error: 'url required' }, { status: 400 });

    const { urlNorm, auditHash } = auditKey(url);

    // Try cache
    const cached = await getCache(auditHash);
    const htmlFresh = isFresh(cached?.html_expires_at);
    const psiFresh = isFresh(cached?.psi_expires_at);

    if (cached && htmlFresh && (!PSI_ON || psiFresh)) {
      return NextResponse.json({ ...cached.report_json, auditHash });
    }

    // Conditional fetch (304 short-circuit)
    if (!(await allowedByRobots(urlNorm))) {
      return NextResponse.json(
        { error: 'Blocked by robots.txt' },
        { status: 403 }
      );
    }

    const condRes = await fetchHTML(urlNorm, {
      ifNoneMatch: cached?.http_etag ?? undefined,
      ifModifiedSince: cached?.last_modified ?? undefined,
    });

    const rag = getRag();

    // If 304 and we have cache, we can:
    // - extend HTML TTL
    // - optionally skip LLM suggestions (content unchanged)
    if (condRes.status === 304 && cached?.report_json) {
      // If PSI is stale and enabled, refresh PSI only and merge
      if (PSI_ON && !psiFresh) {
        const freshForPSI = await auditUrl(
          urlNorm,
          rag,
          process.env.GOOGLE_PSI_KEY
        );
        // merge PSI into cached report (keep findings/suggestions from cache)
        const merged = {
          ...cached.report_json,
          psi: freshForPSI.psi,
          scores: {
            ...cached.report_json.scores,
            technical: freshForPSI.scores.technical,
            metadata: freshForPSI.scores.metadata,
            overall: freshForPSI.scores.overall,
          },
        };
        await putCache({
          auditHash,
          urlRaw: url,
          urlNorm,
          report: merged,
          etag: cached.http_etag,
          lastModified: cached.last_modified,
          contentHash: cached.content_hash,
        });
        return NextResponse.json({ ...merged, auditHash });
      }

      // extend HTML TTL without recomputing
      await q(
        `update crawliq_audits
            set html_expires_at = $1, refreshed_at = now()
          where audit_hash=$2`,
        [
          new Date(Date.now() + HTML_TTL_HOURS * 3600 * 1000).toISOString(),
          auditHash,
        ]
      );
      return NextResponse.json({ ...cached.report_json, auditHash });
    }

    // If 200 with body — we run full audit, but skip LLM suggestions if content_hash unchanged
    const skipLLM =
      cached?.content_hash &&
      condRes.contentHash &&
      cached.content_hash === condRes.contentHash;

    // auditUrl already does LLM suggestions; add a tiny flag to skip suggestions when unchanged
    const report = await auditUrl(urlNorm, rag, process.env.GOOGLE_PSI_KEY, {
      skipSuggestions: skipLLM,
    });

    // If we skipped, carry forward previous suggestions
    if (skipLLM && cached?.report_json?.suggestions) {
      report.suggestions = cached.report_json.suggestions;
    }

    // PSI merge policy: if PSI is fresh in cache and missing/failed now, keep cached PSI
    if (cached?.report_json?.psi && psiFresh && !report.psi) {
      report.psi = cached.report_json.psi;
    }

    await putCache({
      auditHash,
      urlRaw: url,
      urlNorm,
      report,
      etag: condRes.etag,
      lastModified: condRes.lastModified,
      contentHash: condRes.contentHash || undefined,
    });

    return NextResponse.json({ ...report, auditHash });
  } catch (e: any) {
    const msg = String(e?.message || e);
    const code = /Daily limit/i.test(msg) ? 429 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
