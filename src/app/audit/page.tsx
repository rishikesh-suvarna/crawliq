import AuditClient from '@/components/audit/AuditClient';
import SiteFooter from '@/components/site/SiteFooter';
import SiteHeader from '@/components/site/SiteHeader';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Run an audit - CrawlIQ',
  description:
    'Audit any public URL against CrawlIQ technical, content, metadata, link, and media checks.',
};

export default function AuditPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[1440px] flex-col bg-paper">
      <SiteHeader />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="px-6 py-14 font-mono text-xs tracking-[0.1em] text-ink-300 sm:px-10 lg:px-16">
              LOADING AUDIT…
            </div>
          }
        >
          <AuditClient />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
