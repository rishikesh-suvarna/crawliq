'use client';
import { Loader2, Send, StopCircle } from 'lucide-react';
import { useRef, useState } from 'react';

export default function ChatPanel({
  auditHash,
  url,
}: {
  auditHash?: string;
  url?: string;
}) {
  const [q, setQ] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [log, setLog] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);
  const abortRef = useRef<AbortController | null>(null);

  async function ask() {
    if (!q) return;
    if (!auditHash && !url) {
      setLog((l) => [
        ...l,
        { role: 'assistant', content: 'Run an audit first, then chat.' },
      ]);
      return;
    }
    const msg = q;
    setQ('');
    setLog((l) => [
      ...l,
      { role: 'user', content: msg },
      { role: 'assistant', content: '' },
    ]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setIsStreaming(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: msg, auditHash, url }),
        signal: ctrl.signal,
      });

      if (!res.body) {
        setLog((l) => {
          const copy = [...l];
          copy[copy.length - 1] = {
            role: 'assistant',
            content: '(no response body)',
          };
          return copy;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let answer = '';
      // loop until done === true
      while (true) {
        const { value, done } = await reader.read();
        if (done) break; // end-of-stream reached
        answer += decoder.decode(value, { stream: true });
        setLog((l) => {
          const copy = [...l];
          copy[copy.length - 1] = { role: 'assistant', content: answer };
          return copy;
        });
      }
      // Optionally finalize the last message (explicit marker, not required)
      setLog((l) => {
        const copy = [...l];
        copy[copy.length - 1] = { role: 'assistant', content: answer };
        return copy;
      });
    } catch (err: any) {
      // If aborted, the fetch/read will throw — mark the assistant message accordingly.
      const isAbort = err?.name === 'AbortError';
      setLog((l) => {
        const copy = [...l];
        copy[copy.length - 1] = {
          role: 'assistant',
          content: isAbort
            ? '(response aborted)'
            : `(error) ${err?.message ?? err}`,
        };
        return copy;
      });
    } finally {
      // Cleanup state & controller reference — stream finished or errored.
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function stop() {
    // abort the request and the reader; cleanup happens in the catch/finally above
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }

  return (
    <section className="card p-4 space-y-3">
      <h3 className="text-lg font-semibold">Chat about this audit</h3>

      <div className="space-y-2 max-h-80 overflow-auto pr-2">
        {log.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl ${
              m.role === 'user'
                ? 'bg-neutral-100 dark:bg-neutral-800'
                : 'bg-white/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800'
            }`}
          >
            <div className="text-xs opacity-60 mb-1">{m.role}</div>
            <div className="whitespace-pre-wrap text-sm">{m.content}</div>
          </div>
        ))}
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
        {isStreaming && (
          <button type="button" className="btn" onClick={stop}>
            <StopCircle className="w-4 h-4" />
          </button>
        )}
        <button className="btn" type="submit" disabled={isStreaming}>
          {isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Send
        </button>
      </form>
    </section>
  );
}
