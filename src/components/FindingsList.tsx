'use client';

import { motion } from 'framer-motion';

type Finding = {
  id: string;
  severity: 'error' | 'warn' | 'info';
  message: string;
  evidence?: string;
  hint?: string;
  category: string;
};

const color = (s: string) =>
  s === 'error'
    ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
    : s === 'warn'
    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
    : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200';

export default function FindingsList({ findings }: { findings: Finding[] }) {
  return (
    <motion.section
      className="card p-4"
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20%' }}
      transition={{ duration: 0.25 }}
    >
      <h3 className="text-lg font-semibold mb-3">Findings</h3>
      <ul className="space-y-3">
        {findings.map((f, idx) => (
          <motion.li
            key={f.id}
            className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2, delay: idx * 0.02 }}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">{f.id}</div>
              <span className={`badge ${color(f.severity)}`}>{f.severity}</span>
            </div>
            <div className="text-sm mt-1">{f.message}</div>
            {f.evidence && (
              <div className="text-xs mt-1 opacity-70">
                Evidence: {f.evidence}
              </div>
            )}
            {f.hint && (
              <div className="text-xs mt-1 italic opacity-80">
                Hint: {f.hint}
              </div>
            )}
            <div className="text-xs mt-1 opacity-60">
              Category: {f.category}
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}
