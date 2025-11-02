import fetch from 'node-fetch';

export async function allowedByRobots(urlStr: string): Promise<boolean> {
  try {
    const u = new URL(urlStr);
    const robots = new URL(
      '/robots.txt',
      `${u.protocol}//${u.host}`
    ).toString();
    const res = await fetch(robots, { redirect: 'follow' });
    if (!res.ok) return true;
    const txt = await res.text();
    const lines = txt.split(/\r?\n/);
    let applies = false;
    const disallows: string[] = [];
    for (const line of lines) {
      const l = line.trim();
      if (/^user-agent:\s*\*/i.test(l)) {
        applies = true;
        continue;
      }
      if (/^user-agent:/i.test(l)) applies = false;
      if (applies && /^disallow:/i.test(l))
        disallows.push(l.split(':')[1]?.trim() ?? '');
    }
    const path = u.pathname;
    return !disallows.some((d) => d && path.startsWith(d));
  } catch {
    return true;
  }
}

export async function fetchHTML(
  url: string
): Promise<{ html: string; finalUrl: string; status: number }> {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'crawliq/1.0 (+https://example.com)' },
  });
  const html = await res.text();
  return { html, finalUrl: res.url, status: res.status };
}
