import CtaLauncher from '@/components/site/CtaLauncher';
import Hero from '@/components/site/Hero';
import SiteFooter from '@/components/site/SiteFooter';
import SiteHeader from '@/components/site/SiteHeader';
import {
  FAQ,
  FEATURES,
  PROMPTS,
  QUOTES,
  SAMPLE_REPORT,
  STATS,
  STEPS,
} from './(marketing)/content';

export default function LandingPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[1440px] flex-col bg-paper">
      <SiteHeader />
      <main>
        <Hero />

        {/* Stat strip: hairline grid, no card chrome. */}
        <section className="px-6 pb-16 sm:px-10 lg:px-16 lg:pb-[84px]">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
            {STATS.map((s) => (
              <div
                key={s.l}
                className="flex flex-col gap-1.5 bg-paper px-7 py-[26px]"
              >
                <span className="font-display text-[32px] font-bold tracking-[-0.02em]">
                  {s.n}
                </span>
                <span className="text-sm text-ink-300">{s.l}</span>
              </div>
            ))}
          </div>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-20 border-y border-line-soft bg-paper-2 px-6 py-16 sm:px-10 lg:px-16 lg:py-[84px]"
        >
          <span className="eyebrow">HOW IT WORKS</span>
          <h2 className="mt-3.5 mb-8 text-3xl font-bold lg:mb-11 lg:text-[40px]">
            Four steps, one page, no setup
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
            {STEPS.map((st) => (
              <div
                key={st.n}
                className="flex flex-col gap-3 border-t-2 border-ink-800 pt-5"
              >
                <span className="font-mono text-xs text-accent-deep">
                  {st.n}
                </span>
                <span className="font-display text-xl font-semibold">
                  {st.t}
                </span>
                <span className="text-[15px] leading-[1.55] text-ink-400">
                  {st.d}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section
          id="report"
          className="scroll-mt-20 px-6 py-16 sm:px-10 lg:px-16 lg:py-[84px]"
        >
          <span className="eyebrow">THE REPORT</span>
          <h2 className="mt-3.5 mb-2 text-3xl font-bold lg:text-[40px]">
            Every finding comes with its fix
          </h2>
          <p className="m-0 mb-8 max-w-[62ch] text-[17px] text-ink-400 lg:mb-10 lg:text-lg">
            Findings are ranked by impact, tied to the exact element on the
            page, and paired with a generated patch you can paste straight into
            your codebase.
          </p>

          <div className="overflow-hidden rounded-xl border border-line-strong">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft bg-paper-2 px-4 py-4 lg:px-[22px]">
              <span className="font-mono text-[13px]">acme.io/pricing</span>
              <div className="flex flex-wrap gap-2.5">
                <span className="tag tag-crit">3 critical</span>
                <span className="tag tag-warn">7 warnings</span>
                <span className="tag tag-pass">31 passed</span>
              </div>
            </div>

            {SAMPLE_REPORT.map((r) => (
              <div
                key={r.title}
                className="grid items-start gap-4 border-b border-line-soft px-4 py-5 last:border-b-0 lg:grid-cols-[110px_1fr_300px] lg:gap-6 lg:px-[22px]"
              >
                <span className={`tag justify-self-start ${r.tag}`}>
                  {r.sev}
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="font-display text-[17px] font-semibold">
                    {r.title}
                  </span>
                  <span className="text-[15px] leading-[1.5] text-ink-400">
                    {r.detail}
                  </span>
                  <span className="chip-mono mt-0.5">{r.selector}</span>
                </div>
                <div className="flex flex-col gap-[7px] rounded-lg bg-ink-900 px-[15px] py-[13px]">
                  <span className="font-mono text-[10px] tracking-[0.08em] text-accent-bright">
                    AI FIX
                  </span>
                  <span className="font-mono text-xs leading-[1.55] text-on-dark-body">
                    {r.fix}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="assistant"
          className="scroll-mt-20 bg-ink-900 px-6 py-16 text-on-dark sm:px-10 lg:px-16 lg:py-[84px]"
        >
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div className="flex flex-col gap-5">
              <span className="font-mono text-xs tracking-[0.1em] text-accent-bright">
                GROUNDED ASSISTANT
              </span>
              <h2 className="m-0 text-3xl leading-[1.1] font-bold lg:text-[40px]">
                Chat with the audit, not with a search engine
              </h2>
              <p className="m-0 max-w-[46ch] text-[17px] leading-[1.6] text-on-dark-muted lg:text-lg">
                The assistant only sees your crawl: the DOM, the headers, the
                scores, the findings. Ask what to fix first, why a check failed,
                or how a rewrite would read, and every answer cites the finding
                it came from.
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {PROMPTS.map((p) => (
                  <span
                    key={p}
                    className="cursor-pointer rounded-full border border-line-dark px-3.5 py-2 text-sm text-on-dark-value transition-colors hover:border-accent-bright hover:text-on-dark"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3.5 rounded-[14px] bg-ink-800 p-4 lg:p-[22px]">
              <div className="max-w-[86%] self-end rounded-[12px_12px_3px_12px] bg-ink-600 px-4 py-3 text-[15px] leading-[1.5] lg:max-w-[74%]">
                What&apos;s costing me the most traffic here?
              </div>
              <div className="flex max-w-[92%] flex-col gap-2.5 self-start rounded-[12px_12px_12px_3px] bg-ink-700 px-[17px] py-[15px] text-[15px] leading-[1.6] lg:max-w-[86%]">
                <span>
                  Two things, in order. The page returns a soft 200 for{' '}
                  <span className="font-mono text-[13px] text-[oklch(0.78_0.12_218)]">
                    /pricing?plan=
                  </span>{' '}
                  variants, splitting authority across 9 near-duplicate URLs.
                  Then the H1 duplicates the meta title verbatim, so
                  you&apos;re spending both slots on one keyword.
                </span>
                <span className="font-mono text-[11px] text-on-dark-dim">
                  ↳ cites finding #2, #5
                </span>
              </div>
              <div className="flex gap-1.5 self-start px-1.5 py-1">
                {[0, 0.2, 0.4].map((delay) => (
                  <div
                    key={delay}
                    className="size-[7px] rounded-full bg-on-dark-faint"
                    style={{
                      animation: `blink 1.2s ${delay}s infinite`,
                    }}
                  />
                ))}
              </div>
              <div className="mt-1 flex items-center gap-2.5 rounded-[10px] border border-line-dark px-3.5 py-3">
                <span className="flex-1 text-[15px] text-on-dark-faint">
                  Ask about this audit…
                </span>
                <span className="grid size-7 place-items-center rounded-[7px] bg-accent-bright text-[15px] text-ink-900">
                  ↑
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 sm:px-10 lg:px-16 lg:py-[84px]">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {FEATURES.map((f) => (
              <div
                key={f.t}
                className="flex flex-col gap-2.5 rounded-xl border border-line p-[26px]"
              >
                <div className="mb-1 grid size-[30px] place-items-center rounded-lg bg-[oklch(0.94_0.025_218)]">
                  <div className="size-[11px] rounded-[3px] bg-[oklch(0.6_0.13_218)]" />
                </div>
                <span className="font-display text-lg font-semibold">
                  {f.t}
                </span>
                <span className="text-[15px] leading-[1.55] text-ink-400">
                  {f.d}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 pb-16 sm:px-10 lg:px-16 lg:pb-[84px]">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {QUOTES.map((q) => (
              <figure
                key={q.name}
                className="m-0 flex flex-col gap-[18px] rounded-xl bg-paper-2 p-7"
              >
                <blockquote className="m-0 text-[17px] leading-[1.6]">
                  “{q.text}”
                </blockquote>
                <figcaption className="flex items-center gap-[11px]">
                  <div className="size-8 flex-none rounded-full bg-[oklch(0.86_0.01_250)]" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{q.name}</span>
                    <span className="text-[13px] text-ink-300">{q.role}</span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section
          id="faq"
          className="grid scroll-mt-20 gap-8 px-6 pb-16 sm:px-10 lg:grid-cols-[340px_1fr] lg:gap-16 lg:px-16 lg:pb-[84px]"
        >
          <div>
            <span className="eyebrow">FAQ</span>
            <h2 className="mt-3.5 mb-0 text-[28px] leading-[1.15] font-bold lg:text-[34px]">
              Questions we get
              <br className="hidden lg:block" /> before the first run
            </h2>
          </div>
          <div className="flex flex-col">
            {FAQ.map((item) => (
              <div
                key={item.q}
                className="flex flex-col gap-2 border-t border-line py-[22px]"
              >
                <span className="font-display text-lg font-semibold">
                  {item.q}
                </span>
                <span className="max-w-[74ch] text-base leading-[1.6] text-ink-400">
                  {item.a}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-6 mb-16 flex flex-col items-center gap-5 rounded-2xl bg-ink-900 px-6 py-12 text-center sm:mx-10 lg:mx-16 lg:mb-16 lg:p-[72px]">
          <h2 className="m-0 text-[28px] leading-[1.08] font-bold text-on-dark lg:text-[46px] lg:tracking-[-0.03em]">
            Point it at a page.
            <br />
            See what&apos;s broken in four seconds.
          </h2>
          <p className="m-0 text-[15px] text-on-dark-muted lg:text-lg">
            First audit is free and doesn&apos;t need an account.
          </p>
          <CtaLauncher />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
