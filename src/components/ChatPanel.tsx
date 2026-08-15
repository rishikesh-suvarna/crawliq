'use client';

import { useEffect, useRef, useState } from 'react';

const STARTERS = [
  'Which fix ships fastest?',
  'What should I do first?',
  'Rewrite my meta description',
  'Why does this score so low?',
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * The model answers in light markdown. Rather than pull in a renderer, drop the
 * emphasis markers and give inline code the accent treatment the design uses
 * for selectors and URLs.
 */
function renderAnswer(content: string) {
  return content
    .replace(/\*\*/g, '')
    .split(/(`[^`]+`)/g)
    .map((part, i) =>
      part.startsWith('`') && part.endsWith('`') && part.length > 2 ? (
        <span
          key={i}
          className="font-mono text-[13px] text-[oklch(0.78_0.12_218)]"
        >
          {part.slice(1, -1)}
        </span>
      ) : (
        part
      )
    );
}

export default function ChatPanel({
  auditHash,
  url,
}: {
  auditHash?: string;
  url?: string;
}) {
  const [question, setQuestion] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [log, setLog] = useState<Message[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [log]);

  async function ask(text: string) {
    const msg = text.trim();
    if (!msg || isStreaming) return;

    if (!auditHash && !url) {
      setLog((l) => [
        ...l,
        { role: 'assistant', content: 'Run an audit first, then chat.' },
      ]);
      return;
    }

    setQuestion('');
    setLog((l) => [
      ...l,
      { role: 'user', content: msg },
      { role: 'assistant', content: '' },
    ]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsStreaming(true);

    const replaceLast = (content: string) =>
      setLog((l) => {
        const copy = [...l];
        copy[copy.length - 1] = { role: 'assistant', content };
        return copy;
      });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: msg, auditHash, url }),
        signal: ctrl.signal,
      });

      if (!res.body) {
        replaceLast('(no response body)');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        replaceLast(answer);
      }
      replaceLast(answer);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        replaceLast('(response stopped)');
      } else {
        replaceLast(
          `(error) ${err instanceof Error ? err.message : String(err)}`
        );
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }

  const waitingForFirstToken =
    isStreaming && log[log.length - 1]?.content === '';

  return (
    <section
      id="assistant"
      className="panel-dark scroll-mt-20 px-6 py-10 lg:px-12 lg:py-12"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div className="flex flex-col gap-5">
          <span className="font-mono text-xs tracking-[0.1em] text-accent-bright">
            GROUNDED ASSISTANT
          </span>
          <h2 className="m-0 text-2xl leading-[1.1] font-bold lg:text-[34px]">
            Chat with the audit, not with a search engine
          </h2>
          <p className="m-0 max-w-[46ch] text-[17px] leading-[1.6] text-on-dark-muted">
            The assistant only sees this crawl: the DOM excerpts, the scores,
            and the findings. Every answer cites the finding it came from.
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={isStreaming}
                onClick={() => ask(s)}
                className="cursor-pointer rounded-full border border-line-dark px-3.5 py-2 text-sm text-on-dark-value transition-colors hover:border-accent-bright hover:text-on-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3.5 rounded-[14px] bg-ink-800 p-4 lg:p-[22px]">
          <div
            ref={scrollRef}
            className="custom-scrollbar flex max-h-[420px] min-h-[180px] flex-col gap-3.5 overflow-y-auto pr-1"
          >
            {log.length === 0 && (
              <div className="my-auto text-center text-[15px] text-on-dark-faint">
                Ask anything about this audit.
              </div>
            )}

            {log.map((m, i) =>
              m.role === 'user' ? (
                <div
                  key={i}
                  className="max-w-[86%] self-end rounded-[12px_12px_3px_12px] bg-ink-600 px-4 py-3 text-[15px] leading-[1.5] whitespace-pre-wrap"
                >
                  {m.content}
                </div>
              ) : m.content ? (
                <div
                  key={i}
                  className="max-w-[92%] self-start rounded-[12px_12px_12px_3px] bg-ink-700 px-[17px] py-[15px] text-[15px] leading-[1.6] whitespace-pre-wrap"
                >
                  {renderAnswer(m.content)}
                </div>
              ) : null
            )}

            {waitingForFirstToken && (
              <div className="flex gap-1.5 self-start px-1.5 py-1">
                {[0, 0.2, 0.4].map((delay) => (
                  <div
                    key={delay}
                    className="size-[7px] rounded-full bg-on-dark-faint"
                    style={{ animation: `blink 1.2s ${delay}s infinite` }}
                  />
                ))}
              </div>
            )}
          </div>

          <form
            className="mt-1 flex items-center gap-2.5 rounded-[10px] border border-line-dark px-3.5 py-3 focus-within:border-accent-bright"
            onSubmit={(e) => {
              e.preventDefault();
              ask(question);
            }}
          >
            <input
              className="min-w-0 flex-1 bg-transparent text-[15px] text-on-dark outline-none placeholder:text-on-dark-faint"
              placeholder="Ask about this audit…"
              aria-label="Ask about this audit"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            {isStreaming ? (
              <button
                type="button"
                onClick={stop}
                aria-label="Stop generating"
                className="grid size-7 flex-none cursor-pointer place-items-center rounded-[7px] border border-line-dark text-on-dark-value"
              >
                <span className="size-2.5 rounded-[2px] bg-current" />
              </button>
            ) : (
              <button
                type="submit"
                aria-label="Send"
                disabled={!question.trim()}
                className="grid size-7 flex-none cursor-pointer place-items-center rounded-[7px] bg-accent-bright text-[15px] text-ink-900 disabled:opacity-40"
              >
                ↑
              </button>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
