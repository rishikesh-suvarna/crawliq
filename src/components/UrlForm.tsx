'use client';

import { motion } from 'framer-motion';
import { Loader2, Search } from 'lucide-react';
import { useState } from 'react';

export default function UrlForm({
  onSubmit,
  loading,
}: {
  onSubmit: (url: string) => void;
  loading: boolean;
}) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !loading) {
      onSubmit(url.trim());
    }
  };

  return (
    <motion.form
      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative flex-5">
        <input
          name="url"
          className="input pl-[100px] pr-4"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          type="url"
          required
        />
      </div>
      <motion.button
        type="submit"
        className="btn-primary px-8 py-3 rounded-xl whitespace-nowrap flex-1 flex items-center justify-center gap-2 font-bold"
        disabled={loading || !url.trim()}
        whileHover={!loading && url.trim() ? { scale: 1.02, y: -2 } : {}}
        whileTap={!loading && url.trim() ? { scale: 0.98 } : {}}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            Analyze Site
          </>
        )}
      </motion.button>
    </motion.form>
  );
}
