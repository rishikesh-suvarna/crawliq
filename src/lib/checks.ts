import { Parsed } from './parse';

export type Finding = {
  id: string;
  severity: 'error' | 'warn' | 'info';
  message: string;
  evidence?: string;
  hint?: string;
  category: 'content' | 'technical' | 'links' | 'media' | 'metadata';
  weight: number;
};

export function runChecks(parsed: Parsed, _url: string): Finding[] {
  const out: Finding[] = [];
  const push = (f: Finding) => out.push(f);

  if (!parsed.title)
    push({
      id: 'title.missing',
      severity: 'error',
      category: 'metadata',
      weight: 6,
      message: 'Missing <title>.',
      hint: 'Add a concise, keyword-focused title (40–60 chars).',
    });
  else if (parsed.title.length < 15 || parsed.title.length > 65)
    push({
      id: 'title.length',
      severity: 'warn',
      category: 'metadata',
      weight: 2,
      message: `Suboptimal title length (${parsed.title.length}).`,
      evidence: parsed.title,
      hint: 'Aim ~50–60 chars.',
    });

  if (!parsed.metaDesc)
    push({
      id: 'desc.missing',
      severity: 'warn',
      category: 'metadata',
      weight: 3,
      message: 'Missing meta description.',
      hint: 'Add ~150–160 chars compelling summary.',
    });

  if (!parsed.h1)
    push({
      id: 'h1.missing',
      severity: 'error',
      category: 'content',
      weight: 5,
      message: 'Missing H1.',
      hint: 'Include a single descriptive H1.',
    });

  if (!parsed.canonical)
    push({
      id: 'canonical.missing',
      severity: 'warn',
      category: 'technical',
      weight: 2,
      message: 'Missing canonical link.',
      hint: "Add <link rel='canonical'>.",
    });

  if (parsed.metaRobots?.includes('noindex'))
    push({
      id: 'robots.noindex',
      severity: 'error',
      category: 'technical',
      weight: 10,
      message: 'Page is noindex.',
      evidence: parsed.metaRobots,
      hint: 'Remove noindex to rank.',
    });

  const noAlt = parsed.images.filter((i) => !i.alt).length;
  if (noAlt > 0)
    push({
      id: 'img.alt',
      severity: 'warn',
      category: 'media',
      weight: 2,
      message: `${noAlt} images missing alt.`,
      hint: 'Provide descriptive alts.',
    });

  if (!parsed.og['og:title'] || !parsed.og['og:description'])
    push({
      id: 'og.missing',
      severity: 'info',
      category: 'metadata',
      weight: 1,
      message: 'Missing Open Graph tags.',
      hint: 'Add og:title, og:description, og:image.',
    });

  if (parsed.structured.length === 0)
    push({
      id: 'schema.none',
      severity: 'info',
      category: 'technical',
      weight: 1,
      message: 'No JSON-LD structured data found.',
      hint: 'Add relevant schema.org.',
    });

  if (parsed.hreflang.length > 0 && !parsed.lang)
    push({
      id: 'hreflang.lang',
      severity: 'warn',
      category: 'technical',
      weight: 2,
      message: 'Hreflang present but <html lang> missing.',
      hint: "Set <html lang='…'>.",
    });

  if (parsed.wordCount < 250)
    push({
      id: 'content.thin',
      severity: 'warn',
      category: 'content',
      weight: 3,
      message: `Low word count (${parsed.wordCount}).`,
      hint: 'Expand with helpful information.',
    });

  const relNoFollowCount = parsed.links.filter((l) =>
    (l.rel || '').includes('nofollow')
  ).length;
  if (relNoFollowCount > 0 && relNoFollowCount === parsed.links.length)
    push({
      id: 'links.allNofollow',
      severity: 'info',
      category: 'links',
      weight: 1,
      message: 'Most links are nofollow.',
      hint: 'Internal links should usually be followed.',
    });

  return out;
}
