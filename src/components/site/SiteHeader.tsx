import Logo from '@/components/Logo';
import Link from 'next/link';

const NAV = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Report', href: '/#report' },
  { label: 'Assistant', href: '/#assistant' },
  { label: 'FAQ', href: '/#faq' },
];

export default function SiteHeader({ nav = true }: { nav?: boolean }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line-soft bg-paper px-6 py-4 sm:px-10 lg:px-16 lg:py-[22px]">
      <Link href="/" aria-label="CrawlIQ home">
        <Logo />
      </Link>

      {nav && (
        <nav className="hidden gap-[34px] text-[15px] text-ink-500 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-ink-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}

      <div className="flex items-center gap-3">
        <Link
          href="/audit"
          className="hidden text-[15px] text-ink-500 transition-colors hover:text-ink-900 sm:inline"
        >
          Sign in
        </Link>
        <Link href="/audit" className="btn-primary">
          Run a free audit
        </Link>
      </div>
    </header>
  );
}
