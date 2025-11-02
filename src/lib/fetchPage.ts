import crypto from 'crypto';
import fetch from 'node-fetch';

export type FetchOpts = {
  ifNoneMatch?: string | null;
  ifModifiedSince?: string | null;
  userAgent?: string;
};

export type FetchResult = {
  status: number;
  finalUrl: string;
  html?: string; // undefined when 304
  etag?: string | null;
  lastModified?: string | null;
  contentHash?: string | null; // sha256(html) for change detection
  crawlDelaySec?: number | null; // from robots.txt (best-effort)
};

export async function allowedByRobots(urlStr: string): Promise<boolean> {
  try {
    const u = new URL(urlStr);
    const robots = new URL(
      '/robots.txt',
      `${u.protocol}//${u.host}`
    ).toString();
    const res = await fetch(robots, { redirect: 'follow' });
    if (!res.ok) return true;
    const body = await res.text();
    const lines = body.split(/\r?\n/);
    let applies = false;
    for (const raw of lines) {
      const line = raw.trim();
      if (/^user-agent:\s*\*/i.test(line)) {
        applies = true;
        continue;
      }
      if (/^user-agent:/i.test(line)) applies = false;
      if (applies && /^disallow:/i.test(line)) {
        const dis = line.split(':')[1]?.trim() ?? '';
        if (dis && new URL(urlStr).pathname.startsWith(dis)) return false;
      }
    }
    return true;
  } catch {
    return true;
  }
}

export async function robotsCrawlDelay(urlStr: string): Promise<number | null> {
  try {
    const u = new URL(urlStr);
    const robots = new URL(
      '/robots.txt',
      `${u.protocol}//${u.host}`
    ).toString();
    const res = await fetch(robots, { redirect: 'follow' });
    if (!res.ok) return null;
    const txt = await res.text();
    let applies = false;
    for (const raw of txt.split(/\r?\n/)) {
      const line = raw.trim();
      if (/^user-agent:\s*\*/i.test(line)) {
        applies = true;
        continue;
      }
      if (/^user-agent:/i.test(line)) applies = false;
      if (applies && /^crawl-delay:\s*/i.test(line)) {
        const n = Number(line.split(':')[1]);
        return Number.isFinite(n) ? n : null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchHTML(
  url: string,
  opts: FetchOpts = {}
): Promise<FetchResult> {
  const headers: Record<string, string> = {
    'User-Agent': opts.userAgent || 'crawliq/1.1 (+https://example.com)',
  };
  if (opts.ifNoneMatch) headers['If-None-Match'] = opts.ifNoneMatch;
  if (opts.ifModifiedSince) headers['If-Modified-Since'] = opts.ifModifiedSince;

  const res = await fetch(url, { redirect: 'follow', headers });
  const etag = res.headers.get('etag');
  const lastModified = res.headers.get('last-modified');
  const resultBase = {
    status: res.status,
    finalUrl: res.url,
    etag,
    lastModified,
  };

  if (res.status === 304) {
    return {
      ...resultBase,
      contentHash: null,
      crawlDelaySec: await robotsCrawlDelay(url),
    };
  }

  const html = await res.text();
  const hash = crypto.createHash('sha256').update(html).digest('hex');
  return {
    ...resultBase,
    html,
    contentHash: hash,
    crawlDelaySec: await robotsCrawlDelay(url),
  };
}
