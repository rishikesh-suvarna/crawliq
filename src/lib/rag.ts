import OpenAI from 'openai';

export type Node = {
  id: string;
  text: string;
  meta: Record<string, any>;
  vec: number[];
};
const nodes: Node[] = [];
let dim = 0;
const dot = (a: number[], b: number[]) =>
  a.reduce((s, v, i) => s + v * b[i], 0) /
  (Math.hypot(...a) * Math.hypot(...b) || 1);

export class RAG {
  client: OpenAI;
  embModel: string;
  genModel: string;
  constructor(apiKey: string, embModel: string, genModel: string) {
    this.client = new OpenAI({ apiKey });
    this.embModel = embModel;
    this.genModel = genModel;
  }
  async embed(texts: string[]) {
    const r = await this.client.embeddings.create({
      model: this.embModel,
      input: texts,
    });
    return r.data.map((d) => d.embedding as number[]);
  }
  async addMany(chunks: { id: string; text: string; meta: any }[]) {
    const vecs = await this.embed(chunks.map((c) => c.text));
    if (!dim && vecs.length) dim = vecs[0].length;
    chunks.forEach((c, i) =>
      nodes.push({ id: c.id, text: c.text, meta: c.meta, vec: vecs[i] })
    );
  }
  async query(q: string, k = 8) {
    const [qv] = await this.embed([q]);
    return nodes
      .map((n) => ({ n, s: dot(qv, n.vec) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, k);
  }
  async generate(system: string, user: string) {
    const r = await this.client.chat.completions.create({
      model: this.genModel,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });
    return r.choices[0].message.content || '';
  }
}
