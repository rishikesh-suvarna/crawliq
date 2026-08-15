'use client';

import { stripScheme, withScheme } from '@/lib/inputUrl';
import { useState } from 'react';

export default function UrlForm({
  onSubmit,
  loading,
  initialUrl = '',
}: {
  onSubmit: (url: string) => void;
  loading: boolean;
  initialUrl?: string;
}) {
  const [url, setUrl] = useState(stripScheme(initialUrl));

  return (
    <form
      className="url-field w-full"
      onSubmit={(e) => {
        e.preventDefault();
        if (url.trim() && !loading) onSubmit(withScheme(url));
      }}
    >
      <span className="hidden font-mono text-[15px] text-ink-300 sm:inline">
        https://
      </span>
      <input
        name="url"
        type="text"
        inputMode="url"
        autoComplete="url"
        aria-label="Website URL to audit"
        className="url-input"
        placeholder="example.com/pricing"
        value={url}
        onChange={(e) => setUrl(stripScheme(e.target.value))}
        disabled={loading}
      />
      <button
        type="submit"
        className="btn-primary flex-none px-[22px]"
        disabled={loading || !url.trim()}
      >
        {loading ? 'Auditing…' : 'Audit'}
      </button>
    </form>
  );
}
