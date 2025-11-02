import { CHAT_SYS } from '@/lib/prompts';
import { NextRequest, NextResponse } from 'next/server';
import { getRag } from '../_core/rag';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question)
      return NextResponse.json({ error: 'question required' }, { status: 400 });
    const rag = getRag();
    const hits = await rag.query(question, 8);
    const ctx = hits
      .map(({ n }, i) => `[${i + 1}] (${n.meta.type}) ${n.text}`)
      .join('\n---\n');
    const answer = await rag.generate(
      CHAT_SYS,
      `AUDIT:\n${ctx}\n\nQUESTION: ${question}\n\nAnswer with citations like (summary) or ([finding.id]).`
    );
    return NextResponse.json({
      answer,
      citations: hits.map(({ n, s }) => ({
        id: n.id,
        type: n.meta.type,
        score: s,
      })),
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? 'chat failed' },
      { status: 500 }
    );
  }
}
