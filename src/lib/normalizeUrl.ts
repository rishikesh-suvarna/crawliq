export function normalizeUrl(input: string) {
  const u = new URL(input);
  u.hash = '';
  u.hostname = u.hostname.toLowerCase();
  // strip typical tracking params
  const ignore = new Set([
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'gclid',
    'fbclid',
  ]);
  [...u.searchParams.keys()].sort().forEach((k) => {
    if (ignore.has(k)) u.searchParams.delete(k);
  });
  return u.toString();
}
