import { auditUrl } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';
import { getRag } from '../_core/rag';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url)
      return NextResponse.json({ error: 'url required' }, { status: 400 });
    const rag = getRag();
    const report = await auditUrl(url, rag, process.env.GOOGLE_PSI_KEY);
    return NextResponse.json(report);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? 'audit failed' },
      { status: 500 }
    );
  }
}
