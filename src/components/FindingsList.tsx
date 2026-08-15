'use client';

import type { Finding } from '@/lib/checks';
import {
  byImpact,
  CATEGORIES,
  SEVERITY_LABEL,
  SEVERITY_TAG,
  type Severity,
} from '@/lib/severity';
import { useMemo, useState } from 'react';

const SEVERITIES: { key: Severity; label: string; tag: string }[] = [
  { key: 'error', label: 'critical', tag: 'tag-crit' },
  { key: 'warn', label: 'warnings', tag: 'tag-warn' },
  { key: 'info', label: 'notes', tag: 'tag-pass' },
];

export default function FindingsList({
  findings,
  url,
}: {
  findings: Finding[];
  url: string;
}) {
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const counts = useMemo(
    () =>
      findings.reduce<Record<string, number>>((acc, f) => {
        acc[f.severity] = (acc[f.severity] ?? 0) + 1;
        return acc;
      }, {}),
    [findings]
  );

  const visible = useMemo(
    () =>
      [...findings]
        .sort(byImpact)
        .filter((f) => !severity || f.severity === severity)
        .filter((f) => !category || f.category === category),
    [findings, severity, category]
  );

  return (
    <section id="findings" className="flex scroll-mt-20 flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 text-2xl font-bold lg:text-[28px]">
          Every finding comes with its fix
        </h2>
        <span className="text-[15px] text-ink-300">
          {findings.length} finding{findings.length === 1 ? '' : 's'}, ranked by
          impact
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-line-strong">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft bg-paper-2 px-4 py-4 lg:px-[22px]">
          <span className="font-mono text-[13px] break-all">{url}</span>
          <div className="flex flex-wrap gap-2.5">
            {SEVERITIES.map((s) => (
              <button
                key={s.key}
                type="button"
                aria-pressed={severity === s.key}
                onClick={() =>
                  setSeverity((cur) => (cur === s.key ? null : s.key))
                }
                className={`tag cursor-pointer transition-opacity ${s.tag} ${
                  severity && severity !== s.key ? 'opacity-40' : ''
                }`}
              >
                {counts[s.key] ?? 0} {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-line-soft px-4 py-3 lg:px-[22px]">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory((cur) => (cur === c ? null : c))}
              className={`cursor-pointer rounded-full border px-3 py-1 font-mono text-[11px] capitalize transition-colors ${
                category === c
                  ? 'border-ink-800 bg-ink-800 text-on-dark'
                  : 'border-line text-ink-300 hover:border-ink-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {visible.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <span className="font-display text-lg font-semibold">
              {findings.length === 0
                ? 'No issues found on this page'
                : 'Nothing matches these filters'}
            </span>
            <span className="text-[15px] text-ink-300">
              {findings.length === 0
                ? 'Every check passed. Re-run after your next deploy to keep it that way.'
                : 'Clear a filter to see the rest of the report.'}
            </span>
          </div>
        )}

        {visible.map((f) => (
          <div
            key={f.id}
            className="grid items-start gap-4 border-b border-line-soft px-4 py-5 last:border-b-0 lg:grid-cols-[110px_1fr_300px] lg:gap-6 lg:px-[22px]"
          >
            <span
              className={`tag justify-self-start ${SEVERITY_TAG[f.severity]}`}
            >
              {SEVERITY_LABEL[f.severity]}
            </span>

            <div className="flex flex-col gap-1.5">
              <span className="font-display text-[17px] font-semibold">
                {f.message}
              </span>
              <span className="font-mono text-xs text-ink-300">
                {f.id} · {f.category} · weight {f.weight}
              </span>
              {f.evidence && (
                <span className="chip-mono mt-0.5 break-all">{f.evidence}</span>
              )}
            </div>

            {f.hint ? (
              <div className="flex flex-col gap-[7px] rounded-lg bg-ink-900 px-[15px] py-[13px]">
                <span className="font-mono text-[10px] tracking-[0.08em] text-accent-bright">
                  AI FIX
                </span>
                <span className="font-mono text-xs leading-[1.55] text-on-dark-body">
                  {f.hint}
                </span>
              </div>
            ) : (
              <div />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
