'use client';
import { useState } from 'react';

export default function UrlForm({
  onSubmit,
  loading,
}: {
  onSubmit: (url: string) => void;
  loading: boolean;
}) {
  const [url, setUrl] = useState('');
  return (
    <form
      className="flex items-center gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(url);
      }}
    >
      <input
        className="input"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button className="btn" disabled={loading || !url}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
    </form>
  );
}
