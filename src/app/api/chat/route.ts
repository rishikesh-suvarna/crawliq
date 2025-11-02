import { auditKey } from '@/lib/cacheKey';
import { q } from '@/lib/db';
import { NextRequest } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const CHAT_SYS = `
You are an SEO copilot. Use ONLY the supplied AUDIT sections (FINDINGS, SUGGESTIONS, EXCERPTS, PSI).
Cite finding ids like (h1.missing) or sections like (suggestions). If info is not present, say so briefly.
Provide concrete, actionable answers.
`;

async function loadReport(auditHash?: string, url?: string) {
  if (auditHash) {
    const [row] = await q<{ report_json: any }>(
      `select report_json from crawliq_audits where audit_hash=$1 limit 1`,
      [auditHash]
    );
    if (row?.report_json) return row.report_json;
  }
  if (url) {
    const { auditHash: key } = auditKey(url);
    const [row] = await q<{ report_json: any }>(
      `select report_json from crawliq_audits where audit_hash=$1 limit 1`,
      [key]
    );
    if (row?.report_json) return row.report_json;
  }
  return null;
}

function buildPrompt(report: any, question: string) {
  const order = { error: 3, warn: 2, info: 1 } as const;
  const findings = (report.findings || [])
    .sort(
      (a: any, b: any) =>
        order[b.severity] - order[a.severity] || b.weight - a.weight
    )
    .slice(0, 12)
    .map(
      (f: any) =>
        `[${f.id}] ${f.severity.toUpperCase()} – ${f.message}${
          f.evidence ? ` | ${f.evidence}` : ''
        }`
    )
    .join('\n');

  const suggestions = (report.suggestions || '')
    .split('\n')
    .slice(0, 10)
    .join('\n');
  const excerpts = (report.excerpts || [])
    .slice(0, 2)
    .map((e: any) => `(${e.id}) ${String(e.text || '').slice(0, 400)}`)
    .join('\n');

  const psi = report.psi
    ? `SEO ${report.psi.lighthouse?.seo ?? 'NA'}, Perf ${
        report.psi.lighthouse?.performance ?? 'NA'
      }, LCP ${report.psi.lcp ?? 'NA'}, CLS ${report.psi.cls ?? 'NA'}, INP ${
        report.psi.inp ?? 'NA'
      }`
    : 'none';

  return [
    `URL: ${report.finalUrl || report.url}`,
    `SCORES: overall ${report.scores?.overall} | tech ${report.scores?.technical} | content ${report.scores?.content} | metadata ${report.scores?.metadata}`,
    `PSI: ${psi}`,
    `FINDINGS:\n${findings || '(none)'}`,
    `SUGGESTIONS:\n${suggestions || '(none)'} (suggestions)`,
    `EXCERPTS:\n${excerpts || '(none)'}`,
    `QUESTION: ${question}\nAnswer with citations like (h1.missing) or (suggestions) or (excerpts).`,
  ].join('\n---\n');
}

export async function POST(req: NextRequest) {
  const { question, auditHash, url } = await req.json();

  if (!question) {
    return new Response('question required', { status: 400 });
  }

  const report = await loadReport(auditHash, url);
  if (!report) {
    const msg = 'Run an audit first, then chat.';
    return new Response(msg, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const prompt = buildPrompt(report, question);
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  const stream = await client.chat.completions.create({
    model: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
    stream: true,
    messages: [
      { role: 'system', content: CHAT_SYS },
      { role: 'user', content: prompt },
    ],
    max_tokens: 512,
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const token = chunk.choices?.[0]?.delta?.content;
          if (token) controller.enqueue(encoder.encode(token));
        }
      } catch (e: any) {
        controller.enqueue(
          encoder.encode(`\n\n[stream error] ${e?.message || e}`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
