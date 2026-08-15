'use client';

import CrawlMonitor from './CrawlMonitor';
import { SEVERITY_TAG_DARK } from '@/lib/severity';
import type { Finding } from '@/lib/checks';
import type { PSI } from '@/lib/pagespeed';
import type { Scores } from '@/lib/rank';

const PSI_METRICS = [
  { key: 'performance', label: 'Performance', short: 'PERF' },
  { key: 'seo', label: 'Lighthouse SEO', short: 'SEO' },
  { key: 'lcp', label: 'Largest Contentful Paint', short: 'LCP', unit: 's' },
  { key: 'cls', label: 'Cumulative Layout Shift', short: 'CLS' },
  { key: 'inp', label: 'Interaction to Next Paint', short: 'INP', unit: 's' },
] as const;

type PsiKey = (typeof PSI_METRICS)[number]['key'];

function psiValue(psi: PSI | null, key: PsiKey) {
  if (!psi) return null;
  if (key === 'performance' || key === 'seo') {
    return psi.lighthouse?.[key] ?? null;
  }
  return psi[key] ?? null;
}

export default function ScoreCard({
  scores,
  psi,
  url,
  findings,
  elapsedLabel,
}: {
  scores: Scores;
  psi: PSI | null;
  url: string;
  findings: Finding[];
  elapsedLabel: string;
}) {
  const meters = [
    { label: 'Technical', value: scores.technical },
    { label: 'Content', value: scores.content },
    { label: 'Metadata', value: scores.metadata },
    { label: 'Links', value: scores.links },
    { label: 'Media', value: scores.media },
  ];

  // Only the sharpest few belong on the dial; the rest live in the report.
  const headline = findings.slice(0, 3).map((f) => ({
    sev: f.severity.toUpperCase(),
    text: f.message,
    tagClass: SEVERITY_TAG_DARK[f.severity],
  }));

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 text-2xl font-bold lg:text-[28px]">Audit results</h2>
        <span className="font-mono text-[13px] break-all text-ink-300">
          {url}
        </span>
      </div>

      <CrawlMonitor
        score={scores.overall}
        phaseLabel={elapsedLabel}
        meters={meters}
        findings={headline}
        scanning={false}
      />

      <div>
        <span className="eyebrow">PAGESPEED INSIGHTS</span>
        <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
          {PSI_METRICS.map((m) => {
            const value = psiValue(psi, m.key);
            return (
              <div
                key={m.key}
                title={m.label}
                className="flex flex-col gap-1.5 bg-paper px-5 py-[22px]"
              >
                <span className="font-mono text-[11px] tracking-[0.08em] text-accent-deep">
                  {m.short}
                </span>
                <span className="font-display text-[28px] font-bold tracking-[-0.02em]">
                  {value ?? (
                    <span className="text-ink-300">N/A</span>
                  )}
                  {'unit' in m && value != null && (
                    <span className="ml-1 text-sm font-normal text-ink-300">
                      {m.unit}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
        {!psi && (
          <p className="mt-2.5 m-0 text-sm text-ink-300">
            PageSpeed metrics are unavailable. Set{' '}
            <span className="chip-mono inline-block">GOOGLE_PSI_KEY</span> to
            include them in the score.
          </p>
        )}
      </div>
    </section>
  );
}
