'use client';

import { motion } from 'framer-motion';

export default function Suggestions({ text }: { text: string }) {
  return (
    <motion.section
      className="card p-4"
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20%' }}
      transition={{ duration: 0.25 }}
    >
      <h3 className="text-lg font-semibold mb-3">Suggestions</h3>
      <pre className="whitespace-pre-wrap text-sm">{text}</pre>
    </motion.section>
  );
}
