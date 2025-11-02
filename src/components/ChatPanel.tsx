'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function ChatPanel({
  auditHash,
  url,
}: {
  auditHash?: string;
  url?: string;
}) {
  const [q, setQ] = useState('');
  const [log, setLog] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log]);

  async function ask() {
    if (!q.trim() || isLoading) return;
    if (!auditHash && !url) {
      setLog((l) => [
        ...l,
        { role: 'assistant', content: 'Run an audit first, then chat.' },
      ]);
      return;
    }
    const msg = q.trim();
    setQ('');
    setLog((l) => [...l, { role: 'user', content: msg }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: msg, auditHash, url }),
      });
      const json = await res.json();
      setLog((l) => [
        ...l,
        {
          role: 'assistant',
          content: json.answer ?? 'Error: ' + json.error,
        },
      ]);
    } catch (error) {
      setLog((l) => [
        ...l,
        {
          role: 'assistant',
          content: 'Error: Failed to get response',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.section
      className="card p-6 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3">
        <div>
          <h3 className="text-xl font-semibold">AI Assistant</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Ask questions about your audit results
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        ref={scrollRef}
        className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {log.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-neutral-500 dark:text-neutral-500"
            >
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                Start a conversation about your SEO audit
              </p>
            </motion.div>
          )}
          {log.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={`flex ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`p-4 rounded-2xl max-w-[85%] ${
                  m.role === 'user' ? 'message-user' : 'message-assistant'
                }`}
              >
                <div className="text-xs font-medium opacity-70 mb-1.5 uppercase tracking-wide">
                  {m.role === 'user' ? 'You' : 'AI Assistant'}
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {m.content}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="message-assistant p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Form */}
      <form
        className="flex gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
      >
        <input
          className="input flex-1"
          placeholder="Ask about rankings, fixes, priorities..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          disabled={isLoading}
        />
        <motion.button
          type="submit"
          className="btn-primary px-4 flex items-center gap-2 rounded-xl"
          disabled={!q.trim() || isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </motion.button>
      </form>
    </motion.section>
  );
}
