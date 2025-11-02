import { sha256 } from './hash';
import { normalizeUrl } from './normalizeUrl';

export function auditKey(rawUrl: string) {
  const urlNorm = normalizeUrl(rawUrl);
  const model = process.env.OPENAI_MODEL || 'gpt-5';
  const emb = process.env.EMBED_MODEL || 'text-embedding-3-small';
  const psiOn = !!process.env.GOOGLE_PSI_KEY;
  const key = `${urlNorm}|${model}|${emb}|psi:${psiOn ? 'on' : 'off'}`;
  return { urlNorm, auditHash: sha256(key) };
}
