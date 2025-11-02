'use client';

import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

type Finding = {
  id: string;
  severity: 'error' | 'warn' | 'info';
  message: string;
  evidence?: string;
  hint?: string;
  category: string;
};

const severityConfig = {
  error: {
    icon: AlertCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    badge: 'badge-error',
  },
  warn: {
    icon: AlertTriangle,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'badge-warning',
  },
  info: {
    icon: Info,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'badge-info',
  },
};

export default function FindingsList({ findings }: { findings: Finding[] }) {
  const errorCount = findings.filter((f) => f.severity === 'error').length;
  const warnCount = findings.filter((f) => f.severity === 'warn').length;
  const infoCount = findings.filter((f) => f.severity === 'info').length;

  return (
    <motion.section
      className="card p-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold">Findings</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            {findings.length} total issue{findings.length !== 1 ? 's' : ''}{' '}
            detected
          </p>
        </div>
        <div className="flex gap-2">
          {errorCount > 0 && (
            <span className="badge badge-error">{errorCount} Errors</span>
          )}
          {warnCount > 0 && (
            <span className="badge badge-warning">{warnCount} Warnings</span>
          )}
          {infoCount > 0 && (
            <span className="badge badge-info">{infoCount} Info</span>
          )}
        </div>
      </div>

      <ul className="space-y-3">
        {findings.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500 dark:text-emerald-400" />
            <p className="text-neutral-600 dark:text-neutral-400">
              No issues found! Your site looks great.
            </p>
          </motion.div>
        )}
        {findings.map((f, idx) => {
          const config = severityConfig[f.severity];
          const Icon = config.icon;

          return (
            <motion.li
              key={f.id}
              className={`p-4 rounded-xl border ${config.border} ${config.bg} transition-all duration-200 hover:shadow-md`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}
                >
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-sm">{f.id}</h4>
                    <span className={`badge ${config.badge} uppercase text-xs`}>
                      {f.severity}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-2">
                    {f.message}
                  </p>
                  {f.evidence && (
                    <div className="mt-2 p-2 rounded-lg bg-white/50 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-700/50">
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                        <span className="font-semibold">Evidence:</span>{' '}
                        {f.evidence}
                      </p>
                    </div>
                  )}
                  {f.hint && (
                    <div className="mt-2 p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-200/50 dark:border-indigo-800/50">
                      <p className="text-xs text-indigo-700 dark:text-indigo-300">
                        <span className="font-semibold">💡 Hint:</span> {f.hint}
                      </p>
                    </div>
                  )}
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600" />
                      {f.category}
                    </span>
                  </div>
                </div>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </motion.section>
  );
}
