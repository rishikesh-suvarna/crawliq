import * as cheerio from 'cheerio';

export type Parsed = {
  title?: string;
  metaDesc?: string;
  metaRobots?: string;
  canonical?: string;
  h1?: string;
  og: Record<string, string>;
  twitter: Record<string, string>;
  links: { href: string; rel?: string }[];
  images: { src: string; alt?: string }[];
  structured: string[];
  lang?: string;
  hreflang: { href: string; lang: string }[];
  textSample: string;
  wordCount: number;
};

export function parseHTML(html: string): Parsed {
  const $ = cheerio.load(html);
  const textSample = $('body')
    .text()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2000);
  const structured: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) =>
    structured.push($(el).text())
  );
  const og: Record<string, string> = {};
  const twitter: Record<string, string> = {};
  $('meta').each((_, m) => {
    const p = $(m).attr('property') || '';
    const n = $(m).attr('name') || '';
    const c = $(m).attr('content') || '';
    if (p?.startsWith('og:')) og[p] = c;
    if (n?.startsWith('twitter:')) twitter[n] = c;
  });
  return {
    title: $('title').first().text()?.trim(),
    metaDesc: $('meta[name="description"]').attr('content'),
    metaRobots: $('meta[name="robots"]').attr('content'),
    canonical: $('link[rel="canonical"]').attr('href'),
    h1: $('h1').first().text()?.trim(),
    og,
    twitter,
    links: $('a[href]')
      .map((_, a) => ({
        href: $(a).attr('href')!,
        rel: $(a).attr('rel') || undefined,
      }))
      .get(),
    images: $('img[src]')
      .map((_, i) => ({
        src: $(i).attr('src')!,
        alt: $(i).attr('alt') || undefined,
      }))
      .get(),
    structured,
    lang: $('html').attr('lang') || undefined,
    hreflang: $('link[rel="alternate"][hreflang]')
      .map((_, l) => ({
        href: $(l).attr('href')!,
        lang: $(l).attr('hreflang')!,
      }))
      .get(),
    textSample,
    wordCount: $('body').text().trim().split(/\s+/).filter(Boolean).length,
  };
}
