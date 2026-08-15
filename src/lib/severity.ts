import type { Finding } from './checks';

export type Severity = Finding['severity'];

/**
 * The audit engine speaks error/warn/info. The report surface speaks in the
 * language a person acting on it uses, so the two are mapped in one place.
 */
export const SEVERITY_LABEL: Record<Severity, string> = {
  error: 'CRITICAL',
  warn: 'WARNING',
  info: 'NOTE',
};

export const SEVERITY_TAG: Record<Severity, string> = {
  error: 'tag-crit',
  warn: 'tag-warn',
  info: 'tag-pass',
};

export const SEVERITY_TAG_DARK: Record<Severity, string> = {
  error: 'tag-crit-dark',
  warn: 'tag-warn-dark',
  info: 'tag-pass-dark',
};

const SEVERITY_ORDER: Record<Severity, number> = {
  error: 3,
  warn: 2,
  info: 1,
};

/** Highest impact first: severity, then the check's own weight. */
export function byImpact(a: Finding, b: Finding) {
  return SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity] ||
    b.weight - a.weight;
}

export const CATEGORIES = [
  'technical',
  'content',
  'metadata',
  'links',
  'media',
] as const;

export type Category = (typeof CATEGORIES)[number];
