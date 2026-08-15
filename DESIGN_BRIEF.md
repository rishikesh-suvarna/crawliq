# CrawlIQ Design Brief

Context pack for a UI redesign and logo. Written against the codebase as of the current `main`.

## 1. What the product is

CrawlIQ is an AI powered SEO audit and chat platform. You paste a website URL, it crawls the page, scores it across five categories, lists concrete findings, generates prioritized AI fix suggestions, then lets you chat with an assistant grounded in that specific audit.

One page, one job: URL in, actionable SEO report out.

**Audience:** developers, indie founders, and marketers auditing their own site. Technical enough to read `<title>` and `hreflang` without hand holding, so the UI can be dense and precise rather than explanatory.

**Stack:** Next.js 16 (App Router), React 19, Tailwind v4, framer-motion, lucide-react, Manrope. API routes on Node, Postgres for the audit cache, OpenAI for suggestions and chat plus `text-embedding-3-small` for RAG, Google PageSpeed Insights for performance metrics.

## 2. Current user flow

1. Header: wordmark `crawlIQ`, tagline "AI SEO Audit Platform", light/dark toggle
2. URL input card with an "Analyze Site" button
3. Loading state, a spinner plus "Analyzing your website..." (audits genuinely take seconds: crawl, then PSI, then LLM)
4. Results, stacked vertically:
   - **ScoreCard**: overall score badge, five animated circular category scores, five PageSpeed stat tiles
   - **Re-run Audit Now**, full width button (currently confirms with a browser `alert()`)
   - Two column grid: **Findings** on the left, **AI Suggestions** on the right
   - **ChatPanel**: streaming token by token chat about the audit
5. Error card for failures: blocked by robots.txt, daily cap reached, fetch failure

## 3. Domain vocabulary the UI has to express

**Findings.** Each has a severity (`error`, `warn`, `info`), a dotted id (`h1.missing`, `robots.noindex`, `img.alt`), a message, an optional evidence snippet, an optional hint, a category, and a numeric weight. The 11 checks today:

| id | severity | category |
| --- | --- | --- |
| `title.missing` | error | metadata |
| `title.length` | warn | metadata |
| `desc.missing` | warn | metadata |
| `h1.missing` | error | content |
| `canonical.missing` | warn | technical |
| `robots.noindex` | error | technical |
| `img.alt` | warn | media |
| `og.missing` | info | metadata |
| `schema.none` | info | technical |
| `hreflang.lang` | warn | technical |
| `content.thin` | warn | content |
| `links.allNofollow` | info | links |

**Categories.** `content`, `technical`, `metadata`, `links`, `media`. These five are the spine of the product: they appear as scores and again as tags on every finding. A redesign should give them a consistent icon and colour identity.

**Scores.** 0 to 100 per category plus an overall. Banded at 80+ (good), 60+ (needs work), below 60 (poor).

**PSI metrics.** Two are 0 to 100 scores (Performance, SEO), three are raw values with units (LCP in seconds, CLS unitless, INP in seconds). All five are often `N/A` because the PageSpeed API key is optional, so the empty state for these tiles matters.

**Suggestions.** Raw LLM text, 6 to 10 prioritized bullets, each citing a finding id in parentheses. Currently split on newlines with regex guessing at headers, no real markdown rendering.

**Chat.** Streams plain text and cites finding ids inline, like `(h1.missing)` or `(suggestions)`.

## 4. Existing visual language (what is being replaced)

- Accent: indigo 500 to purple 600 gradient, defined as `--gradient-start` / `--gradient-end`
- Score bands: emerald, amber, red
- Cards: glassmorphic, `rounded-2xl`, backdrop blur, translucent borders, hover lift
- Motion: framer-motion entrance animations on nearly every element, staggered children, circular score rings that animate their stroke offset
- Typography: Manrope for everything
- Semantic classes in `src/app/globals.css`: `.card`, `.btn`, `.btn-primary`, `.btn-icon`, `.input`, `.badge-*`, `.score-*`, `.message-user`, `.message-assistant`, `.gradient-text`, `.custom-scrollbar`

## 5. Problems the redesign should solve

**Light mode does not work.** `body { @apply bg-black text-white }` hard codes dark, while the theme toggle only flips a `dark` class on `<html>`. The toggle appears to do nothing meaningful. The new design needs a proper two theme token set with no hard coded body colours.

**No brand assets exist.** `public/` still contains the stock Next.js SVGs (`next.svg`, `vercel.svg`, `globe.svg`, `file.svg`, `window.svg`) and `src/app/favicon.ico` is the Next default. There is no logo of any kind. Name casing is also inconsistent: `crawlIQ` in the page header versus `CrawlIQ` in the document metadata. Pick one and use it everywhere.

**No first run state.** Before an audit there is just an empty input. No hero, no explanation, no example URLs, no sense of what the tool will return.

**No audit history.** Every audit is already cached in Postgres keyed by a hash of the normalized URL, so a recent audits list is available for free but is not surfaced anywhere.

**Findings are not navigable.** No filter by severity or category, no counts that act as filters, no grouping, no per finding "how do I fix this" affordance beyond the one line hint.

**Suggestions render poorly.** Markdown from the model is displayed as bare lines in grey boxes.

**Chat is buried.** It sits at the bottom of a long scroll, so the user has to scroll past everything to ask a question about what they just read. A persistent side panel or docked composer would suit it better.

**No report export or share.**

**Small leftovers:** the URL input carries a phantom `pl-[100px]` with no icon in that space, `flex-5` in `UrlForm` is not a real Tailwind class, and the re-run confirmation uses `window.alert()`.

## 6. Screens and states to design

- First run / empty state (before any audit)
- Loading, ideally with real progress phases: fetching page, running checks, PageSpeed, AI suggestions
- Full report
- Findings zero state ("no issues found")
- PSI unavailable state (no API key, all five tiles `N/A`)
- Error states: blocked by robots.txt, daily limit reached (cap is 10 per day), fetch failure
- Chat: idle, streaming, aborted, "run an audit first"
- Light and dark, both fully working

## 7. Logo direction

The name is a portmanteau: **crawl** (web crawler, spidering, indexing) plus **IQ** (the AI intelligence layer). The mark should read as analytical rather than cute, and should not lean on a literal spider.

Concepts that fit the product honestly:

- A score ring or gauge arc. This is already the dominant shape in the UI, so a mark echoing it ties the logo directly to the product surface.
- A node graph or crawl path, small connected nodes suggesting link traversal.
- A magnifier over structure, inspection rather than generic search.
- An abstract `C` + `Q` lockup built from the ring geometry.

Requirements:

- Legible as a 16px favicon
- Works beside a wordmark in the header at roughly 32 to 40px
- Readable on both a light and a dark background, ideally a single mark rather than two variants
- Should survive being flattened to one colour

## 8. Paste ready prompt

> Design a new UI and logo for **CrawlIQ**, an AI powered SEO audit and chat platform built with Next.js 16, React 19, and Tailwind v4.
>
> **The product:** you paste a website URL, it crawls the page, scores it 0 to 100 across five categories (technical, content, metadata, links, media) plus an overall score, lists concrete findings, generates prioritized AI fix suggestions, and lets you chat with an assistant grounded in that audit. The audience is developers and technical marketers, so the UI can be dense and precise rather than explanatory.
>
> **Data to display:** an overall score plus five category scores (banded at 80+ good, 60+ needs work, below 60 poor); five PageSpeed metrics (Performance and SEO as 0 to 100 scores, LCP and INP in seconds, CLS unitless, all frequently unavailable); a list of findings, each with a severity of error, warn, or info, a dotted id like `h1.missing`, a message, an optional evidence snippet, an optional fix hint, and one of the five categories; a block of AI generated markdown suggestions that cite finding ids in parentheses; and a streaming chat panel.
>
> **Screens and states needed:** first run empty state before any audit, a multi phase loading state (fetch, checks, PageSpeed, AI), the full report, a no issues found state, a PageSpeed unavailable state, error states (blocked by robots.txt, daily limit reached, fetch failure), and the chat in idle, streaming, and aborted states. Light and dark themes, both fully working.
>
> **Improve on the current build:** the report is one long vertical scroll with the chat stranded at the bottom, findings cannot be filtered by severity or category, there is no first run state, and past audits are cached server side but never surfaced. Consider a persistent chat panel, filterable findings, and a recent audits list.
>
> **Move away from:** the current indigo to purple gradient with glassmorphic cards and heavy entrance animation on every element. Aim for something calmer and more instrument like, closer to a diagnostics dashboard than a marketing page. Keep the five categories visually distinct and consistent wherever they appear.
>
> **Logo:** the name is crawl (web crawler, indexing, link traversal) plus IQ (the AI layer). Analytical, not cute, no literal spider. The circular score ring is the dominant shape in the product, so a mark echoing a gauge, ring, or node graph would tie the brand to the interface. Must read at 16px as a favicon, work beside a wordmark at 32 to 40px, hold up on both light and dark backgrounds, and survive being flattened to a single colour. Deliver a mark plus a wordmark lockup and settle the casing as CrawlIQ.
