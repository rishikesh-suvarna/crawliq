import { Finding } from './checks';
import { PSI } from './pagespeed';

export type Scores = {
  technical: number;
  content: number;
  metadata: number;
  links: number;
  media: number;
  overall: number;
};

export function score(findings: Finding[], psi: PSI | null): Scores {
  const base = {
    technical: 100,
    content: 100,
    metadata: 100,
    links: 100,
    media: 100,
  } as Scores;
  for (const f of findings) {
    const p = f.severity === 'error' ? 12 : f.severity === 'warn' ? 6 : 2;
    (base as any)[f.category] = Math.max(
      0,
      (base as any)[f.category] - f.weight * p
    );
  }
  if (psi?.lighthouse?.seo != null)
    base.metadata = Math.round(base.metadata * 0.6 + psi.lighthouse.seo * 0.4);
  if (psi?.lighthouse?.performance != null)
    base.technical = Math.round(
      base.technical * 0.7 + psi.lighthouse.performance * 0.3
    );
  const overall = Math.round(
    (base.technical + base.content + base.metadata + base.links + base.media) /
      5
  );
  return { ...base, overall };
}
