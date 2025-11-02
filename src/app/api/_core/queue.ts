import { auditUrl } from '@/lib/audit';
import { auditKey } from '@/lib/cacheKey';
import { q } from '@/lib/db';
import { robotsCrawlDelay } from '@/lib/fetchPage';
import pLimit from 'p-limit';
import { getRag } from './rag';

type Job = { url: string; auditHash: string; urlNorm: string };

const limit = pLimit(5); // global concurrency
const hostLocks = new Map<string, number>(); // host -> nextAllowedTs

async function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForHostGate(url: string) {
  const host = new URL(url).host;
  const now = Date.now();
  const unlockAt = hostLocks.get(host) ?? now;
  const delayMs = Math.max(0, unlockAt - now);
  if (delayMs > 0) await wait(delayMs);
  const cd = (await robotsCrawlDelay(url)) ?? 1;
  hostLocks.set(host, Date.now() + cd * 1000);
}

export async function enqueueRecrawl(url: string) {
  const { urlNorm, auditHash } = auditKey(url);
  const host = new URL(urlNorm).host;

  return limit(async () => {
    await waitForHostGate(urlNorm);
    try {
      const rag = getRag();
      const report = await auditUrl(urlNorm, rag, process.env.GOOGLE_PSI_KEY);
      // store result (reuse putCache logic via SQL upsert)
      const htmlExp = new Date(Date.now() + 6 * 3600 * 1000).toISOString(); // 1 hours
      const psiExp = new Date(Date.now() + 48 * 3600 * 1000).toISOString(); // 12 hours
      await q(
        `insert into crawliq_audits (url, url_norm, audit_hash, report_json, status_code, html_expires_at, psi_expires_at, refreshed_at)
         values ($1,$2,$3,$4,$5,$6,$7,now())
         on conflict (audit_hash) do update set report_json=excluded.report_json, status_code=excluded.status_code, html_expires_at=excluded.html_expires_at, psi_expires_at=excluded.psi_expires_at, refreshed_at=now()`,
        [
          url,
          urlNorm,
          auditHash,
          report,
          report?.status ?? 200,
          htmlExp,
          psiExp,
        ]
      );
    } catch {
      /* swallow */
    }
  });
}
