# CrawlIQ

**CrawlIQ** is an AI-powered SEO auditing and chat platform.
Paste any website URL and get instant rankings, errors, and actionable improvement suggestions — then chat with an AI SEO assistant trained on the audit.

> GitHub → [https://github.com/rishikesh-suvarna/crawliq](https://github.com/rishikesh-suvarna/crawliq)

---

## Features

- **Instant SEO Audit** – Fetches the page, runs HTML checks, metadata analysis, image alt verification, schema detection, and more.
- **AI-Generated Suggestions** – GPT-5 summarizes key improvements and prioritizes issues.
- **Chat with Your Audit** – Ask natural-language questions about rankings, fixes, or optimizations.
- **RAG-Based Context** – Uses embeddings to let GPT reference audit data accurately.
- **Smart Crawling** – Respects `robots.txt`, uses conditional requests (`ETag`, `Last-Modified`), and obeys crawl-delay.
- **Caching & TTLs** – Caches audits with separate HTML and PSI lifetimes.
- **Background Recrawls** – Stale pages refresh automatically via queue with host rate-limit.
- **Re-run Audit Button** – Manual invalidation and background re-analysis.
- **Cost Guardrails** – Daily user caps and “skip LLM suggestions” when content is unchanged.

---

## Tech Stack

| Layer            | Tech                                       |
| ---------------- | ------------------------------------------ |
| Frontend         | Next.js 14 (App Router) + TailwindCSS      |
| Backend          | Next.js API routes (Node)                  |
| LLM / Embeddings | OpenAI GPT-5 + `text-embedding-3-small`    |
| Database         | PostgreSQL (Neon/Vercel Postgres friendly) |
| Queue            | In-memory rate-limited worker (`p-limit`)  |
| Auditing         | Cheerio HTML parser + Google PageSpeed API |

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/rishikesh-suvarna/crawliq.git
cd crawliq
npm install
```

### 2. Environment variables

Copy .env.example → .env and fill values:

```bash
cp .env.example .env
```

OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5
EMBED_MODEL=text-embedding-3-small
GOOGLE_PSI_KEY= # optional PageSpeed API key
DATABASE_URL=postgresql://user:pass@host:port/dbname

### 3. Database setup

Run the migrations to set up the database schema:

```bash
psql $DATABASE_URL -f sql/migrations.sql
```

### 4. Run the app

```bash
npm run dev
```

The app should now be running at [http://localhost:3000](http://localhost:3000)
