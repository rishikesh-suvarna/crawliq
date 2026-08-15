'use client';

import CrawlMonitor from '@/components/CrawlMonitor';
import { stripScheme, withScheme } from '@/lib/inputUrl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { DEMO, HERO } from '@/app/(marketing)/content';

const TICK_MS = 40;
const LOOP_TICKS = 260;
const SETTLE_TICKS = 120;
const FINDING_EVERY = 26;
const FINDING_DELAY = 40;

function phaseFor(progress: number) {
  if (progress < 0.35) return 'FETCHING DOM · 128 NODES';
  if (progress < 0.7) return 'RUNNING 40 CHECKS';
  if (progress < 1) return 'GENERATING FIXES';
  return 'AUDIT COMPLETE · 4.1s';
}

/**
 * Left column is the real entry point; right column replays a finished audit on
 * a loop so the page shows what it does rather than describing it. The loop
 * pauses off-screen and settles instantly when motion is reduced.
 */
export default function Hero() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  // Start settled: the server renders a finished audit, so the panel is
  // meaningful before hydration and stays that way if motion is reduced.
  const [tick, setTick] = useState(LOOP_TICKS);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Derive the tick from wall-clock time rather than counting invocations:
    // a busy main thread delays the interval, and a counter would let the
    // demo drift out of sync with the timings it is claiming to show.
    const startedAt = performance.now();
    let id: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (id === null) {
        id = setInterval(
          () =>
            setTick(((performance.now() - startedAt) / TICK_MS) % LOOP_TICKS),
          TICK_MS
        );
      }
    };
    const stop = () => {
      if (id !== null) {
        clearInterval(id);
        id = null;
      }
    };
    const onVisibility = () =>
      document.visibilityState === 'visible' ? start() : stop();

    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const progress = Math.min(1, tick / SETTLE_TICKS);
  const eased = 1 - Math.pow(1 - progress, 3);
  const score = Math.round(DEMO.targetScore * eased);
  const meters = DEMO.meterTargets.map((m) => ({
    label: m.label,
    value: Math.round(m.value * eased),
  }));
  const shown = Math.max(
    0,
    Math.min(
      DEMO.findings.length,
      Math.floor((tick - FINDING_DELAY) / FINDING_EVERY)
    )
  );
  const typedUrl = DEMO.url.slice(
    0,
    Math.min(DEMO.url.length, Math.round(tick / 2))
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    router.push(`/audit?url=${encodeURIComponent(withScheme(url))}`);
  }

  return (
    <section className="grid items-center gap-10 px-6 pt-14 pb-12 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:px-16 lg:pt-[88px] lg:pb-[72px]">
      <div className="flex min-w-0 flex-col gap-5 lg:gap-[26px]">
        <span className="eyebrow-accent">{HERO.eyebrow}</span>

        <h1 className="m-0 text-4xl leading-[1.06] font-bold sm:text-5xl lg:text-[62px] lg:leading-[1.04] lg:tracking-[-0.03em]">
          {HERO.headline[0]}
          <br />
          {HERO.headline[1]}
        </h1>

        <p className="m-0 max-w-[46ch] text-base leading-[1.55] text-ink-400 lg:text-[19px]">
          {HERO.body}
        </p>

        <form onSubmit={submit} className="url-field max-w-[520px]">
          <span className="font-mono text-[15px] text-ink-300">https://</span>
          <span className="relative flex min-w-0 flex-1 items-center">
            <input
              ref={inputRef}
              name="url"
              type="text"
              inputMode="url"
              autoComplete="url"
              aria-label="Website URL to audit"
              className="url-input"
              value={url}
              onChange={(e) => setUrl(stripScheme(e.target.value))}
            />
            {url === '' && (
              <span
                aria-hidden="true"
                onClick={() => inputRef.current?.focus()}
                className="pointer-events-none absolute inset-y-0 flex items-center font-mono text-[15px] text-ink-300"
              >
                {typedUrl}
                <span className="animate-blink">|</span>
              </span>
            )}
          </span>
          <button type="submit" className="btn-primary flex-none px-[22px]">
            Audit
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-300 lg:gap-6">
          {HERO.reassurances.map((r, i) => (
            <span key={r} className="flex items-center gap-3 lg:gap-6">
              {i > 0 && <span aria-hidden="true">·</span>}
              {r}
            </span>
          ))}
        </div>
      </div>

      <CrawlMonitor
        score={score}
        phaseLabel={phaseFor(progress)}
        meters={meters}
        findings={DEMO.findings.slice(0, shown)}
      />
    </section>
  );
}
