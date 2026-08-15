import { Mark } from '@/components/Logo';

const LINKS = ['Docs', 'Changelog', 'Privacy', 'Contact'];

export default function SiteFooter() {
  return (
    <footer className="flex flex-col gap-4 border-t border-line-soft px-6 py-8 text-sm text-ink-300 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-8">
      <div className="flex items-center gap-[9px]">
        <Mark size={20} tone="muted" />
        <span>© {new Date().getFullYear()} CrawlIQ</span>
      </div>
      <div className="flex flex-wrap gap-5 lg:gap-[26px]">
        {LINKS.map((l) => (
          <span key={l} className="cursor-pointer transition-colors hover:text-ink-800">
            {l}
          </span>
        ))}
      </div>
    </footer>
  );
}
