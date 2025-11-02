import { auditKey } from '@/lib/cacheKey';
import { q } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

// Keep system prompt concise & strict
const CHAT_SYS = `
You are an SEO copilot. Use ONLY the supplied AUDIT sections (FINDINGS, SUGGESTIONS, EXCERPTS, PSI).
Cite finding ids like (h1.missing) or sections like (suggestions). If info is not present, say so briefly.
Provide concrete, actionable answers.
`;

async function loadReportByAuditHashOrUrl(auditHash?: string, url?: string) {
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

export async function POST(req: NextRequest) {
  try {
    const { question, auditHash, url } = await req.json();
    if (!question)
      return NextResponse.json({ error: 'question required' }, { status: 400 });

    const report = await loadReportByAuditHashOrUrl(auditHash, url);
    if (!report) {
      return NextResponse.json({
        answer:
          "I don't have an audit loaded for this URL. Please run an audit first and try again.",
      });
    }

    // Build compact, grounded context from the cached report
    const findingsText = (report.findings || [])
      .map(
        (f: any) =>
          `[${f.id}] ${f.severity.toUpperCase()} – ${f.message}${
            f.evidence ? ` | evidence: ${f.evidence}` : ''
          }`
      )
      .join('\n');

    const psi = report.psi
      ? `Lighthouse SEO: ${report.psi.lighthouse?.seo ?? 'NA'}, Perf: ${
          report.psi.lighthouse?.performance ?? 'NA'
        }, LCP: ${report.psi.lcp ?? 'NA'}, CLS: ${
          report.psi.cls ?? 'NA'
        }, INP: ${report.psi.inp ?? 'NA'}`
      : 'PSI: none';

    const excerpts = (report.excerpts || [])
      .map((e: any) => `(${e.id}) ${e.text}`)
      .join('\n');

    const ctx = [
      `URL: ${report.finalUrl || report.url}`,
      `SCORES: overall ${report.scores?.overall} | technical ${report.scores?.technical} | content ${report.scores?.content} | metadata ${report.scores?.metadata}`,
      `PSI: ${psi}`,
      `FINDINGS:\n${findingsText || '(none)'}`,
      `SUGGESTIONS:\n${report.suggestions || '(none)'} (suggestions)`,
      `EXCERPTS:\n${excerpts || '(none)'}`,
    ].join('\n---\n');

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const chat = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5',
      messages: [
        { role: 'system', content: CHAT_SYS },
        {
          role: 'user',
          content: `AUDIT:\n${ctx}\n\nQUESTION: ${question}\n\nAnswer with citations as (finding.id) or (suggestions) or (excerpts).`,
        },
      ],
      // no temperature: gpt-5 only supports default
    });

    const answer =
      chat.choices[0].message.content ??
      "Sorry, I couldn't generate an answer.";
    return NextResponse.json({ answer });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? 'chat failed' },
      { status: 500 }
    );
  }
}
