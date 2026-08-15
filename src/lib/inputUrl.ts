const SCHEME = /^\s*https?:\/\//i;

/**
 * The URL fields render their own `https://` prefix, so a pasted absolute URL
 * would otherwise read as `https:// https://example.com`. Strip the scheme on
 * the way in, put it back on the way out.
 */
export function stripScheme(value: string) {
  return value.replace(SCHEME, '');
}

export function withScheme(value: string) {
  const trimmed = value.trim();
  return SCHEME.test(trimmed) ? trimmed : `https://${trimmed}`;
}
