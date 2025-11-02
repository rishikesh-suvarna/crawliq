'use client';
import ChatPanel from '@/components/ChatPanel';
import FindingsList from '@/components/FindingsList';
import ScoreCard from '@/components/ScoreCard';
import Suggestions from '@/components/Suggestions';
import UrlForm from '@/components/UrlForm';
import { useState } from 'react';

export default function Page() {
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze(url: string) {
    setLoading(true);
    setReport(null);
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const json = await res.json();
    setReport(json);
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">CrawlIQ</h1>
      </header>

      <div className="card p-4">
        <UrlForm onSubmit={analyze} loading={loading} />
      </div>

      {report && !report.error && (
        <>
          <ScoreCard
            scores={report.scores}
            psi={report.psi}
            url={report.finalUrl}
          />
          <div className="grid md:grid-cols-2 gap-6">
            <FindingsList findings={report.findings} />
            <Suggestions text={report.suggestions} />
          </div>
          <ChatPanel />
        </>
      )}

      {report?.error && (
        <div className="card p-4 text-red-600">Error: {report.error}</div>
      )}
    </main>
  );
}
