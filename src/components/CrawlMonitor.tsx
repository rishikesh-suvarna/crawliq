'use client';

const RING_CIRCUMFERENCE = 326.7;

export interface Meter {
  label: string;
  value: number;
}

export interface MonitorFinding {
  sev: string;
  text: string;
  tagClass: string;
}

/**
 * The dark instrument panel: score dial, category meters, and findings landing
 * as they are detected. Shared by the marketing hero and the live audit run, so
 * it takes everything as props and owns no timing of its own.
 *
 * Every dimension is set in CSS rather than JS so the panel can shrink to the
 * design's compact mobile treatment. The ring scales via its viewBox.
 */
export default function CrawlMonitor({
  score,
  phaseLabel,
  meters,
  findings,
  scanning = true,
}: {
  score: number;
  phaseLabel: string;
  meters: Meter[];
  findings: MonitorFinding[];
  scanning?: boolean;
}) {
  const dashOffset = RING_CIRCUMFERENCE * (1 - score / 100);

  return (
    <div className="panel-dark relative min-w-0 overflow-hidden p-5 lg:p-[26px]">
      {scanning && (
        <div className="animate-scan absolute inset-x-0 h-0.5 bg-accent-bright shadow-[0_0_24px_4px_oklch(0.72_0.14_218/0.5)]" />
      )}

      <div className="mb-[18px] flex items-center gap-2.5 lg:mb-[22px]">
        <div className="size-[9px] flex-none rounded-full bg-accent-bright" />
        <span className="font-mono text-xs text-on-dark-dim">{phaseLabel}</span>
      </div>

      <div className="mb-[18px] flex items-center gap-[18px] lg:mb-6 lg:gap-[26px]">
        <div className="relative size-24 flex-none lg:size-[124px]">
          <svg viewBox="0 0 124 124" className="size-full">
            <circle
              cx="62"
              cy="62"
              r="52"
              fill="none"
              stroke="oklch(0.3 0.015 250)"
              strokeWidth="10"
            />
            <circle
              cx="62"
              cy="62"
              r="52"
              fill="none"
              stroke="oklch(0.72 0.14 218)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 62 62)"
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center font-display text-[28px] font-bold text-on-dark lg:text-4xl">
            {score}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2 lg:gap-[9px]">
          {meters.map((m) => (
            <div key={m.label} className="flex items-center gap-2 lg:gap-3">
              <span className="w-[62px] flex-none font-mono text-[10px] text-on-dark-dim lg:w-[92px] lg:text-[11px]">
                {m.label}
              </span>
              <div className="h-[5px] min-w-0 flex-1 overflow-hidden rounded-[3px] bg-ink-700 lg:h-1.5">
                <div
                  className="h-full rounded-[3px] bg-accent-bright transition-[width] duration-500 ease-out"
                  style={{ width: `${m.value}%` }}
                />
              </div>
              {/* The narrow layout gives the bar the space the readout used. */}
              <span className="hidden w-[26px] flex-none text-right font-mono text-[11px] text-on-dark-value lg:block">
                {m.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-[7px] lg:gap-2">
        {findings.map((f, i) => (
          <div
            key={`${f.sev}-${i}`}
            className="animate-pop flex items-start gap-2.5 rounded-lg bg-ink-800 px-3 py-[11px] lg:gap-3 lg:px-3.5 lg:py-3"
          >
            <span
              className={`tag flex-none px-1.5 py-[3px] text-[10px] ${f.tagClass}`}
            >
              {f.sev}
            </span>
            <span className="min-w-0 text-[13px] leading-[1.4] text-on-dark-body lg:text-sm">
              {f.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
