// app/api/analyze/route.ts
import { auditUrl } from '@/lib/audit';
import { auditKey } from '@/lib/cacheKey';
import { q } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getRag } from '../_core/rag';

export const runtime = 'nodejs';

const TTL_HTML_HOURS = 2;

async function getCached(auditHash: string) {
  const rows = await q<{ report_json: any; expires_at: string }>(
    `select report_json, expires_at
       from crawliq_audits
      where audit_hash = $1
      limit 1`,
    [auditHash]
  );
  return rows[0] ?? null;
}

async function putCache(params: {
  auditHash: string;
  urlRaw: string;
  urlNorm: string;
  report: any;
}) {
  const { auditHash, urlRaw, urlNorm, report } = params;
  const expiresAt = new Date(
    Date.now() + TTL_HTML_HOURS * 3600 * 1000
  ).toISOString();

  await q(
    `insert into crawliq_audits
       (url, url_norm, audit_hash, report_json, status_code, expires_at, refreshed_at)
     values ($1, $2, $3, $4, $5, $6, now())
     on conflict (audit_hash)
     do update set
       report_json = excluded.report_json,
       status_code = excluded.status_code,
       expires_at = excluded.expires_at,
       refreshed_at = now()`,
    [urlRaw, urlNorm, auditHash, report, report?.status ?? 200, expiresAt]
  );
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'url required' }, { status: 400 });
    }

    // Normalize and compute stable cache key
    const { urlNorm, auditHash } = auditKey(url);

    // 1) Try cache
    const cached = await getCached(auditHash);
    if (cached) {
      const fresh = new Date(cached.expires_at) > new Date();
      if (fresh) {
        return NextResponse.json(cached.report_json);
      }
      // stale-while-revalidate: return cached immediately, refresh in background
      (async () => {
        try {
          const rag = getRag();
          const freshReport = await auditUrl(
            urlNorm,
            rag,
            process.env.GOOGLE_PSI_KEY
          );
          await putCache({
            auditHash,
            urlRaw: url,
            urlNorm,
            report: freshReport,
          });
        } catch {
          // best-effort refresh; ignore errors here
        }
      })();
      return NextResponse.json(cached.report_json);
    }

    // 2) Compute fresh
    const rag = getRag();
    const report = await auditUrl(urlNorm, rag, process.env.GOOGLE_PSI_KEY);

    // 3) Store
    await putCache({ auditHash, urlRaw: url, urlNorm, report });

    return NextResponse.json(report);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? 'audit failed' },
      { status: 500 }
    );
  }
}
