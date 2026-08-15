'use client';

import { withScheme } from '@/lib/inputUrl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/** Closing CTA field, styled for the dark panel it sits on. */
export default function CtaLauncher() {
  const router = useRouter();
  const [url, setUrl] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!url.trim()) return;
        router.push(`/audit?url=${encodeURIComponent(withScheme(url))}`);
      }}
      className="mt-2 flex w-full max-w-[460px] flex-col items-stretch gap-2.5 rounded-[10px] sm:flex-row sm:items-center sm:bg-ink-800 sm:p-[7px] sm:pl-[18px]"
    >
      <input
        name="url"
        type="text"
        inputMode="url"
        aria-label="Website URL to audit"
        placeholder="https://yourdomain.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="min-w-0 flex-1 rounded-[10px] bg-ink-800 px-4 py-3 font-mono text-[15px] text-on-dark outline-none placeholder:text-on-dark-faint sm:rounded-none sm:bg-transparent sm:p-0"
      />
      <button type="submit" className="btn-accent flex-none">
        Run audit
      </button>
    </form>
  );
}
