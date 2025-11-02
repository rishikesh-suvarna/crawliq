import { Finding, runChecks } from './checks';
import { allowedByRobots, fetchHTML } from './fetchPage';
import { getPSI, PSI } from './pagespeed';
import { parseHTML } from './parse';
import { SUGGESTIONS_SYS } from './prompts';
import { RAG } from './rag';
import { score, Scores } from './rank';

export type AuditReport = {
  url: string;
  finalUrl: string;
  status: number;
  findings: Finding[];
  psi: PSI | null;
  scores: Scores;
  suggestions: string;
  excerpts: { id: string; text: string }[];
};

export async function auditUrl(
  url: string,
  rag: RAG,
  psiKey?: string
): Promise<AuditReport> {
  if (!(await allowedByRobots(url))) throw new Error('Blocked by robots.txt');
  const { html, finalUrl, status } = await fetchHTML(url);
  const parsed = parseHTML(html);
  const findings = runChecks(parsed, finalUrl);
  const psi = await getPSI(finalUrl, psiKey);
  const scores = score(findings, psi);

  const evidence = [
    `TITLE: ${parsed.title || '(missing)'}`,
    `H1: ${parsed.h1 || '(missing)'}`,
    `META DESCRIPTION: ${parsed.metaDesc || '(missing)'}`,
    `CANONICAL: ${parsed.canonical || '(missing)'}`,
    `ROBOTS: ${parsed.metaRobots || '(none)'}`,
  ].join('\n');
  const psiTxt = psi
    ? `Lighthouse SEO: ${psi.lighthouse?.seo ?? 'NA'}, Perf: ${
        psi.lighthouse?.performance ?? 'NA'
      }, LCP: ${psi.lcp ?? 'NA'}, CLS: ${psi.cls ?? 'NA'}, INP: ${
        psi.inp ?? 'NA'
      }`
    : 'PSI: skipped';

  const userPrompt = `EVIDENCE:
Findings:
${findings
  .map(
    (f) =>
      `- [${f.id}] (${f.severity}) ${f.message} ${
        f.evidence ? `| evidence: ${f.evidence}` : ''
      } ${f.hint ? `| hint: ${f.hint}` : ''} (cat:${f.category}, weight:${
        f.weight
      })`
  )
  .join('\n')}
---
DOM EXCERPTS:
${evidence}
---
METRICS:
${psiTxt}
Return 6–10 prioritized bullets.`;

  const suggestions = await rag.generate(SUGGESTIONS_SYS, userPrompt);

  const chunks = [
    {
      id: 'summary',
      text: `Overall score ${scores.overall}. ${psiTxt}.`,
      meta: { type: 'summary', url: finalUrl },
    },
    {
      id: 'findings',
      text: findings
        .map(
          (f) => `[${f.id}] ${f.message} (${f.severity}) ${f.evidence || ''}`
        )
        .join('\n'),
      meta: { type: 'findings', url: finalUrl },
    },
    {
      id: 'suggestions',
      text: suggestions,
      meta: { type: 'suggestions', url: finalUrl },
    },
  ];
  await rag.addMany(chunks);

  return {
    url,
    finalUrl,
    status,
    findings,
    psi,
    scores,
    suggestions,
    excerpts: [{ id: 'dom', text: evidence }],
  };
}
