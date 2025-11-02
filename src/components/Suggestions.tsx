'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Sparkles } from 'lucide-react';

export default function Suggestions({ text }: { text: string }) {
  // Parse suggestions into lines for better formatting
  const lines = text.split('\n').filter((line) => line.trim());

  return (
    <motion.section
      className="card p-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
          <Lightbulb className="w-5 h-5 text-white" fill="white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">AI Suggestions</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Personalized recommendations for improvement
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {lines.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-neutral-400 dark:text-neutral-600" />
            <p className="text-neutral-600 dark:text-neutral-400">
              No suggestions available at the moment
            </p>
          </motion.div>
        )}

        {lines.map((line, idx) => {
          // Detect if it's a header (typically all caps or starts with number/bullet)
          const isHeader =
            line.match(/^[A-Z\s]+:/) ||
            line.match(/^[\d]+\./) ||
            line.match(/^[-•]/);

          if (isHeader) {
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="font-semibold text-neutral-900 dark:text-neutral-100 mt-4 first:mt-0"
              >
                {line}
              </motion.div>
            );
          }

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
            >
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {line}
              </p>
            </motion.div>
          );
        })}

        {lines.length === 0 && text && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700"
          >
            <pre className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300 font-sans leading-relaxed">
              {text}
            </pre>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
