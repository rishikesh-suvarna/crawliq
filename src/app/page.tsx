'use client';

import ChatPanel from '@/components/ChatPanel';
import FindingsList from '@/components/FindingsList';
import ScoreCard from '@/components/ScoreCard';
import Suggestions from '@/components/Suggestions';
import UrlForm from '@/components/UrlForm';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun, Zap } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../components/ThemeProvider';

export default function Page() {
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <motion.header
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">crawlIQ</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              AI SEO Audit Platform
            </p>
          </div>
        </div>

        <motion.button
          onClick={toggleTheme}
          className="btn-icon"
          whileHover={{ scale: 1.05, rotate: 15 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait">
            {theme === 'light' ? (
              <motion.div
                key="moon"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.header>

      {/* URL Form Card */}
      <motion.div
        className="card p-6"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-1">Analyze Your Website</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Enter a URL to get comprehensive SEO insights and recommendations
          </p>
        </div>
        <UrlForm onSubmit={analyze} loading={loading} />
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div
          className="card p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
            <div>
              <p className="text-lg font-medium">Analyzing your website...</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                This may take a few moments
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Report Results */}
      <AnimatePresence mode="wait">
        {report && !report.error && (
          <motion.div
            key="report"
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <ScoreCard
              scores={report.scores}
              psi={report.psi}
              url={report.finalUrl}
            />

            <motion.button
              className="btn"
              whileHover={{ scale: 1.02, y: -2 }}
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
              <Zap className="w-4 h-4" />
              Re-run Audit Now
            </motion.button>

            <div className="grid lg:grid-cols-2 gap-6">
              <FindingsList findings={report.findings} />
              <Suggestions text={report.suggestions} />
            </div>

            <ChatPanel
              auditHash={report.auditHash}
              url={report.finalUrl || report.url}
            />
          </motion.div>
        )}

        {report?.error && (
          <motion.div
            key="error"
            className="card p-6 border-red-200 dark:border-red-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 text-xl">
                  ⚠️
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  Analysis Error
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {report.error}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
