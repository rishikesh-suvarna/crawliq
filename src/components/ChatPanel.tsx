'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

export default function ChatPanel() {
  const [q, setQ] = useState('');
  const [log, setLog] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);

  async function ask() {
    if (!q) return;
    const msg = q;
    setQ('');
    setLog((l) => [...l, { role: 'user', content: msg }]);
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question: msg }),
    });
    const json = await res.json();
    setLog((l) => [
      ...l,
      { role: 'assistant', content: json.answer ?? 'Error: ' + json.error },
    ]);
  }

  return (
    <motion.section
      className="card p-4 space-y-3"
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20%' }}
      transition={{ duration: 0.25 }}
    >
      <h3 className="text-lg font-semibold">Chat about this audit</h3>

      <div className="space-y-2 max-h-80 overflow-auto pr-2">
        <AnimatePresence initial={false}>
          {log.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className={`p-3 rounded-xl ${
                m.role === 'user'
                  ? 'bg-neutral-100 dark:bg-neutral-800'
                  : 'bg-white/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div className="text-xs opacity-60 mb-1">{m.role}</div>
              <div className="whitespace-pre-wrap text-sm">{m.content}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
      >
        <input
          className="input"
          placeholder="Ask about rankings, fixes, priorities…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <motion.button
          className="btn"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          Send
        </motion.button>
      </form>
    </motion.section>
  );
}
