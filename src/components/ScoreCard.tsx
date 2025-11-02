'use client';

import { motion } from 'framer-motion';
import { Gauge, TrendingUp, Zap } from 'lucide-react';

function CircularScore({ score, label }: { score: number; label: string }) {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-emerald-600 dark:text-emerald-500';
    if (s >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGradient = (s: number) => {
    if (s >= 80) return 'from-emerald-400 to-emerald-600';
    if (s >= 60) return 'from-amber-400 to-amber-600';
    return 'from-red-400 to-red-600';
  };

  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r="36"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-neutral-200 dark:text-neutral-800"
          />
          {/* Progress circle */}
          <motion.circle
            cx="48"
            cy="48"
            r="36"
            stroke="url(#gradient)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                className={
                  score >= 80
                    ? 'stop-emerald-400'
                    : score >= 60
                    ? 'stop-amber-400'
                    : 'stop-red-400'
                }
                stopOpacity="1"
              />
              <stop
                offset="100%"
                className={
                  score >= 80
                    ? 'stop-emerald-600'
                    : score >= 60
                    ? 'stop-amber-600'
                    : 'stop-red-600'
                }
                stopOpacity="1"
              />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${getColor(score)}`}>
            {score ?? 'N/A'}
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

export default function ScoreCard({
  scores,
  psi,
  url,
}: {
  scores: any;
  psi: any;
  url: string;
}) {
  const scoreMetrics = [
    { label: 'Technical', value: scores.technical },
    { label: 'Content', value: scores.content },
    { label: 'Metadata', value: scores.metadata },
    { label: 'Links', value: scores.links },
    { label: 'Media', value: scores.media },
  ];

  const performanceMetrics = [
    {
      label: 'Perf',
      value: psi?.lighthouse?.performance,
      icon: Zap,
      fullform: 'Performance',
    },
    {
      label: 'SEO',
      value: psi?.lighthouse?.seo,
      icon: TrendingUp,
      fullform: 'SEO',
    },
    {
      label: 'LCP',
      value: psi?.lcp,
      unit: 's',
      icon: Gauge,
      fullform: 'Largest Contentful Paint',
    },
    {
      label: 'CLS',
      value: psi?.cls,
      icon: Gauge,
      fullform: 'Cumulative Layout Shift',
    },
    {
      label: 'INP',
      value: psi?.inp,
      unit: 's',
      icon: Gauge,
      fullform: 'Interaction to Next Paint',
    },
  ];

  return (
    <motion.section
      className="card p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold mb-1">SEO Audit Results</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
            {url}
          </p>
        </div>
        <motion.div
          className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white shadow-lg text-black dark:bg-neutral-800 dark:text-white"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-black dark:text-white text-center">
            <div className="text-xs font-medium opacity-90">Overall Score</div>
            <div className="text-2xl font-bold">{scores.overall}</div>
          </div>
        </motion.div>
      </div>

      {/* Main Scores */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-4">
          Category Breakdown
        </h3>
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {scoreMetrics.map((metric) => (
            <motion.div
              key={metric.label}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <CircularScore score={metric.value} label={metric.label} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-4">
          Performance Metrics (PageSpeed Insights)
        </h3>
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {performanceMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <motion.div
                title={metric.fullform}
                key={metric.label}
                className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow"
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  show: { opacity: 1, scale: 1 },
                }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-emerald-500" />
                  <span
                    className="text-xs font-medium text-emerald-500 uppercase tracking-wide"
                    title={metric.fullform}
                  >
                    {metric.label}
                  </span>
                </div>
                <div className="text-2xl font-bold">
                  {metric.value ?? 'N/A'}
                  {metric.unit && metric.value && (
                    <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400 ml-1">
                      {metric.unit}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
}
