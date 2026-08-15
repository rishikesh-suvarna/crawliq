/**
 * Landing page copy, lifted verbatim from the CrawlIQ design document.
 *
 * PLACEHOLDER CLAIMS - replace before this page is public.
 * The numbers in `STATS`, the "40+ checks" and "4.1s" figures in `HERO`, and
 * every entry in `QUOTES` are invented design copy, not measurements of this
 * build. The audit engine currently runs 11 checks across the 5 categories in
 * `src/lib/checks.ts`, and no named customer has endorsed the product.
 */

export const HERO = {
  eyebrow: '● LIVE CRAWL · 4.1s AVERAGE',
  eyebrowShort: '● LIVE CRAWL · 4.1s AVG',
  headline: ['Audit any page.', 'Then ask it questions.'],
  body: 'Paste a URL. CrawlIQ fetches the page, scores it against 40+ technical and content checks, writes the fixes, and hands the whole audit to an assistant you can interrogate.',
  bodyShort:
    'Paste a URL. CrawlIQ scores the page against 40+ checks, writes the fixes, and hands the audit to an assistant.',
  reassurances: ['No account for the first run', '40+ checks', 'Export to CSV'],
};

export const STATS = [
  { n: '40+', l: 'Checks per crawl' },
  { n: '4.1s', l: 'Median audit time' },
  { n: '12k', l: 'Pages audited this week' },
  { n: '0', l: 'Setup steps' },
];

export const STEPS = [
  {
    n: '01',
    t: 'Paste a URL',
    d: 'No account, no crawler config, no verification file to upload.',
  },
  {
    n: '02',
    t: 'We fetch and parse',
    d: 'Rendered DOM, headers, robots, sitemap, and Core Web Vitals in one pass.',
  },
  {
    n: '03',
    t: 'Score and rank',
    d: '40+ checks scored by impact, grouped into technical, content, performance, indexing.',
  },
  {
    n: '04',
    t: 'Fix, then ask',
    d: 'Every finding ships with a patch, and an assistant that knows your audit.',
  },
];

export const FEATURES = [
  {
    t: 'Rendered-DOM crawl',
    d: 'We evaluate the page after hydration, so client-rendered content is scored the way a modern crawler sees it.',
  },
  {
    t: 'Impact-ranked findings',
    d: 'Ordered by estimated traffic effect, not by check ID, so you always know what to do first.',
  },
  {
    t: 'Generated patches',
    d: 'Each fix arrives as concrete markup or config, scoped to the selector that failed.',
  },
  {
    t: 'Grounded chat',
    d: 'The assistant reads only your crawl artifacts and cites the finding behind every claim.',
  },
  {
    t: 'Re-run and diff',
    d: 'Audit again after shipping and see exactly which findings closed.',
  },
  {
    t: 'CSV and JSON export',
    d: 'Hand the full report to a client or pipe it into your own reporting stack.',
  },
];

export const FEATURES_SHORT = [
  {
    t: 'Rendered-DOM crawl',
    d: 'Scored after hydration, the way a modern crawler sees it.',
  },
  {
    t: 'Impact-ranked findings',
    d: 'Ordered by traffic effect, not by check ID.',
  },
  {
    t: 'Generated patches',
    d: 'Concrete markup or config, scoped to the failing selector.',
  },
  { t: 'Re-run and diff', d: 'Audit again and see which findings closed.' },
];

export const PROMPTS = [
  'Which fix ships fastest?',
  'Why did check 14 fail?',
  'Rewrite my meta description',
  "Compare to last week's run",
];

export const QUOTES = [
  {
    text: 'I stopped keeping a spreadsheet of client audit notes. The chat answers what I used to go looking for.',
    name: 'Dana Whitfield',
    role: 'Founder, Northrail SEO',
  },
  {
    text: 'First tool where the fix suggestion was actually pasteable. Shipped six of them the same afternoon.',
    name: 'Marcus Oyelaran',
    role: 'Frontend lead, Tildeworks',
  },
  {
    text: 'Four seconds from URL to a ranked list is the whole pitch. Our whole team runs it before launch.',
    name: 'Priya Raghunathan',
    role: 'Growth, Sunbeam Health',
  },
];

export const FAQ = [
  {
    q: 'Does it crawl the whole site or one page?',
    a: "One page per audit by default, that's what keeps runs under five seconds. Multi-page crawls are available on paid plans.",
  },
  {
    q: 'What is the assistant allowed to see?',
    a: 'Only the artifacts from your crawl: rendered DOM, response headers, robots and sitemap entries, scores, and findings. It has no general web access during the conversation.',
  },
  {
    q: 'Do I need to install anything?',
    a: "No. There's no script tag, no DNS record, and no verification file. Paste a public URL and the audit runs server-side.",
  },
  {
    q: 'Are the fixes safe to paste?',
    a: "They're scoped to the selector that failed and reviewed against the rest of the page, but treat them as a strong first draft rather than an automated commit.",
  },
  {
    q: 'Can I re-run an audit after shipping fixes?',
    a: 'Yes, re-runs are diffed against the previous audit so you can see which findings closed and which regressed.',
  },
];

/** The sample report shown in "Every finding comes with its fix". */
export const SAMPLE_REPORT = [
  {
    sev: 'CRITICAL',
    tag: 'tag-crit',
    title: 'H1 duplicates the meta title verbatim',
    detail:
      'Both slots target the same phrase, wasting a ranking signal and flattening the snippet.',
    selector: 'main > header > h1',
    fix: 'Rewrite H1 as "Pricing for teams of 2-200" and keep the meta title keyword-led.',
  },
  {
    sev: 'CRITICAL',
    tag: 'tag-crit',
    title: 'Query-param variants return soft 200s',
    detail:
      '9 URLs resolve to the same content with no canonical, splitting authority across the set.',
    selector: '/pricing?plan=*',
    fix: 'Add <link rel="canonical" href="/pricing"> and disallow ?plan= in robots.txt.',
  },
  {
    sev: 'WARNING',
    tag: 'tag-warn',
    title: 'LCP image ships at 812 KB',
    detail:
      'The hero screenshot is a full-res PNG with no width hints; LCP lands at 3.8s on 4G.',
    selector: 'img.hero-shot',
    fix: 'Convert to AVIF at 1600w, add sizes + priority via next/image.',
  },
  {
    sev: 'WARNING',
    tag: 'tag-warn',
    title: 'Internal links use generic anchor text',
    detail:
      '14 links read "learn more", passing no topical context to the target pages.',
    selector: 'a[href^="/docs"]',
    fix: 'Replace with descriptive anchors: "API rate limits", "SSO setup".',
  },
];

/** Timeline for the animated hero demo, in the design's own numbers. */
export const DEMO = {
  url: 'acme.io/pricing',
  targetScore: 87,
  meterTargets: [
    { label: 'Technical', value: 92 },
    { label: 'Content', value: 74 },
    { label: 'Performance', value: 68 },
    { label: 'Indexing', value: 96 },
  ],
  findings: [
    {
      sev: 'CRIT',
      tagClass: 'tag-crit-dark',
      text: 'Meta description missing on 3 of 4 indexed routes',
    },
    {
      sev: 'CRIT',
      tagClass: 'tag-crit-dark',
      text: '9 near-duplicate URLs from unhandled query params',
    },
    {
      sev: 'WARN',
      tagClass: 'tag-warn-dark',
      text: 'LCP image 812 KB, served unoptimised',
    },
    {
      sev: 'PASS',
      tagClass: 'tag-pass-dark',
      text: 'Structured data valid, Product and FAQPage',
    },
  ],
};
