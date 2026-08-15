'use client';

/** Strips the model's bullet and emphasis markers so lines read as prose. */
function clean(line: string) {
  return line
    .replace(/^\s*[-•*]\s*/, '')
    .replace(/^\s*\d+[.)]\s*/, '')
    .replace(/\*\*/g, '')
    .trim();
}

function isHeading(line: string) {
  return /^[A-Z][A-Za-z\s]{2,40}:$/.test(line) || /^#{1,4}\s/.test(line);
}

export default function Suggestions({ text }: { text: string }) {
  const lines = (text || '')
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 text-2xl font-bold lg:text-[28px]">
          Prioritised suggestions
        </h2>
        <span className="text-[15px] text-ink-300">
          Generated from this crawl only
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-line-strong">
        {lines.length === 0 && (
          <div className="px-6 py-12 text-center text-[15px] text-ink-300">
            No suggestions were generated for this page.
          </div>
        )}

        {lines.map((line, i) => {
          if (isHeading(line)) {
            return (
              <div
                key={i}
                className="border-b border-line-soft bg-paper-2 px-4 py-3 font-mono text-xs tracking-[0.08em] text-ink-300 uppercase lg:px-[22px]"
              >
                {line.replace(/^#{1,4}\s*/, '').replace(/:$/, '')}
              </div>
            );
          }

          return (
            <div
              key={i}
              className="flex items-start gap-4 border-b border-line-soft px-4 py-4 last:border-b-0 lg:px-[22px]"
            >
              <span className="mt-1.5 size-[7px] flex-none rounded-full bg-accent" />
              <span className="text-[15px] leading-[1.6] text-ink-800">
                {clean(line)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
