import { auditKey } from '@/lib/cacheKey';
import { q } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { enqueueRecrawl } from '../_core/queue';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url)
    return NextResponse.json({ error: 'url required' }, { status: 400 });

  const { auditHash } = auditKey(url);
  // mark expired immediately
  await q(
    `update crawliq_audits set html_expires_at = now() - interval '1 second' where audit_hash=$1`,
    [auditHash]
  );

  // enqueue background recrawl
  await enqueueRecrawl(url);

  return NextResponse.json({ ok: true });
}
