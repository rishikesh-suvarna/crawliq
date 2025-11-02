import { RAG } from '@/lib/rag';

const globalForRag = globalThis as unknown as { rag?: RAG };
export function getRag() {
  if (!globalForRag.rag) {
    const apiKey = process.env.OPENAI_API_KEY!;
    const emb = process.env.EMBED_MODEL || 'text-embedding-3-small';
    const gen = process.env.OPENAI_MODEL || 'gpt-5';
    globalForRag.rag = new RAG(apiKey, emb, gen);
  }
  return globalForRag.rag!;
}
