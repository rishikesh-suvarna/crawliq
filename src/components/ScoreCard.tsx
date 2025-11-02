'use client';

import { motion } from 'framer-motion';

export default function ScoreCard({
  scores,
  psi,
  url,
}: {
  scores: any;
  psi: any;
  url: string;
}) {
  const pill = (label: string, v: number) => (
    <span className="badge bg-neutral-100 dark:bg-neutral-800">
      {label}: <span className="font-semibold">{v ?? 'NA'}</span>
    </span>
  );

  return (
    <motion.section
      className="card p-4 space-y-3"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Audit – {url}</h2>
        <div className="badge bg-neutral-200 dark:bg-neutral-800">
          Overall: <span className="font-bold">{scores.overall}</span>
        </div>
      </div>

      <motion.div
        className="flex flex-wrap gap-2"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.04 } },
        }}
      >
        {['technical', 'content', 'metadata', 'links', 'media'].map((k) => (
          <motion.div
            key={k}
            variants={{
              hidden: { opacity: 0, y: 6 },
              show: { opacity: 1, y: 0 },
            }}
          >
            {pill(k[0].toUpperCase() + k.slice(1), scores[k])}
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="flex flex-wrap gap-2 opacity-80"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.04 } },
        }}
      >
        {[
          ['Lighthouse Perf', psi?.lighthouse?.performance],
          ['Lighthouse SEO', psi?.lighthouse?.seo],
          ['LCP(s)', psi?.lcp],
          ['CLS', psi?.cls],
          ['INP(s)', psi?.inp],
        ].map(([label, v]) => (
          <motion.div
            key={label as string}
            variants={{
              hidden: { opacity: 0, y: 6 },
              show: { opacity: 1, y: 0 },
            }}
          >
            {pill(label as string, v as number)}
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
