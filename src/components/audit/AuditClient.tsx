'use client';

import ChatPanel from '@/components/ChatPanel';
import CrawlMonitor from '@/components/CrawlMonitor';
import FindingsList from '@/components/FindingsList';
import ScoreCard from '@/components/ScoreCard';
import Suggestions from '@/components/Suggestions';
import UrlForm from '@/components/UrlForm';
import type { Report } from '@/lib/report';
import { byImpact } from '@/lib/severity';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The API returns one payload at the end, so the monitor narrates the pipeline
 * on elapsed time. The thresholds mirror the real order of work in
 * `auditUrl`: fetch, then checks, then PageSpeed, then the LLM pass.
 */
const PHASES = [
  { at: 0, label: 'FETCHING PAGE' },
  { at: 2000, label: 'RUNNING CHECKS' },
  { at: 4000, label: 'MEASURING PAGESPEED' },
  { at: 11000, label: 'GENERATING FIXES' },
];

const IDLE_METERS = [
  { label: 'Technical', value: 0 },
  { label: 'Content', value: 0 },
  { label: 'Metadata', value: 0 },
  { label: 'Links', value: 0 },
  { label: 'Media', value: 0 },
];

function phaseFor(elapsedMs: number) {
  const phase = [...PHASES].reverse().find((p) => elapsedMs >= p.at);
  return `${phase?.label ?? PHASES[0].label} · ${(elapsedMs / 1000).toFixed(1)}s`;
}

export default function AuditClient() {
  const params = useSearchParams();
  const initialUrl = params.get('url') ?? '';

  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [rerunNote, setRerunNote] = useState<string | null>(null);
  const startedAt = useRef(0);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setElapsed(Date.now() - startedAt.current), 100);
    return () => clearInterval(id);
  }, [loading]);

  const analyze = useCallback(async (url: string) => {
    setLoading(true);
    setReport(null);
    setError(null);
    setRerunNote(null);
    setElapsed(0);
    startedAt.current = Date.now();

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok || json?.error) {
        setError(json?.error || `Audit failed (${res.status})`);
      } else {
        setReport(json);
      }
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : 'Could not reach the audit service.'
      );
    } finally {
      setDuration(Date.now() - startedAt.current);
      setLoading(false);
    }
  }, []);

  // Auto-run when arriving from the landing page with ?url=.
  const autoRan = useRef(false);
  useEffect(() => {
    if (initialUrl && !autoRan.current) {
      autoRan.current = true;
      analyze(initialUrl);
    }
  }, [initialUrl, analyze]);

  async function rerun() {
    const url = report?.finalUrl || report?.url;
    if (!url) return;
    setRerunNote('Queueing a fresh crawl…');
    try {
      await fetch('/api/invalidate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      setRerunNote(null);
      await analyze(url);
    } catch {
      setRerunNote('Could not queue a re-run. Try again in a moment.');
    }
  }

  const findings = report?.findings ? [...report.findings].sort(byImpact) : [];
  const auditedUrl = report?.finalUrl || report?.url || initialUrl;

  return (
    <div className="flex flex-col gap-10 px-6 py-10 sm:px-10 lg:gap-14 lg:px-16 lg:py-14">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="eyebrow-accent">● AUDIT A PAGE</span>
          <h1 className="m-0 text-[32px] leading-[1.06] font-bold lg:text-[42px]">
            Paste a URL. Get the fixes.
          </h1>
        </div>
        <div className="max-w-[640px]">
          <UrlForm
            onSubmit={analyze}
            loading={loading}
            initialUrl={initialUrl}
          />
        </div>
        {report && !loading && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={rerun}
              className="btn-ghost"
              disabled={loading}
            >
              Re-run this audit
            </button>
            {rerunNote && (
              <span className="text-sm text-ink-300">{rerunNote}</span>
            )}
          </div>
        )}
      </section>

      {loading && (
        <CrawlMonitor
          score={0}
          phaseLabel={phaseFor(elapsed)}
          meters={IDLE_METERS}
          findings={[]}
        />
      )}

      {error && !loading && (
        <section className="overflow-hidden rounded-xl border border-line-strong">
          <div className="border-b border-line-soft bg-paper-2 px-4 py-4 lg:px-[22px]">
            <span className="tag tag-crit">AUDIT FAILED</span>
          </div>
          <div className="flex flex-col gap-2 px-4 py-6 lg:px-[22px]">
            <span className="font-display text-[17px] font-semibold">
              {error}
            </span>
            <span className="text-[15px] leading-[1.6] text-ink-400">
              Blocked pages, unreachable hosts, and the daily audit cap all land
              here. Check the URL is public and try again.
            </span>
          </div>
        </section>
      )}

      {report && !loading && (
        <>
          <ScoreCard
            scores={report.scores}
            psi={report.psi}
            url={auditedUrl}
            findings={findings}
            elapsedLabel={`AUDIT COMPLETE · ${((duration ?? 0) / 1000).toFixed(1)}s`}
          />
          <FindingsList findings={findings} url={auditedUrl} />
          <Suggestions text={report.suggestions} />
          <ChatPanel auditHash={report.auditHash} url={auditedUrl} />
        </>
      )}

      {!report && !loading && !error && (
        <section className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line-strong px-6 py-16 text-center">
          <span className="font-display text-xl font-semibold">
            Nothing audited yet
          </span>
          <span className="max-w-[46ch] text-[15px] leading-[1.6] text-ink-400">
            Enter any public URL above. The crawl respects robots.txt, runs in a
            few seconds, and the first ten runs each day are free.
          </span>
        </section>
      )}
    </div>
  );
}
