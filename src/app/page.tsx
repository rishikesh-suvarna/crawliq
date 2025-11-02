'use client';

import ChatPanel from '@/components/ChatPanel';
import FindingsList from '@/components/FindingsList';
import ScoreCard from '@/components/ScoreCard';
import Suggestions from '@/components/Suggestions';
import UrlForm from '@/components/UrlForm';
import { AnimatePresence, motion } from 'framer-motion';
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
      <motion.header
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <h1 className="text-3xl font-semibold">CrawlIQ</h1>
      </motion.header>

      <motion.div
        className="card p-4"
        initial={{ opacity: 0, y: 6, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        <UrlForm onSubmit={analyze} loading={loading} />
      </motion.div>

      <AnimatePresence mode="popLayout">
        {report && !report.error && (
          <motion.div
            key="report"
            className="space-y-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <ScoreCard
              scores={report.scores}
              psi={report.psi}
              url={report.finalUrl}
            />

            <motion.button
              className="btn"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                await fetch('/api/invalidate', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({ url: report.finalUrl || report.url }),
                });
                alert('Re-run queued! Results will refresh on next analyze.');
              }}
            >
              Re-run audit now
            </motion.button>

            <div className="grid md:grid-cols-2 gap-6">
              <FindingsList findings={report.findings} />
              <Suggestions text={report.suggestions} />
            </div>

            <ChatPanel />
          </motion.div>
        )}

        {report?.error && (
          <motion.div
            key="error"
            className="card p-4 text-red-600"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            Error: {report.error}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
