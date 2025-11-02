'use client';

import { motion } from 'framer-motion';
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
    <motion.form
      className="flex items-center gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(url);
      }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <input
        className="input"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <motion.button
        className="btn"
        disabled={loading || !url}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </motion.button>
    </motion.form>
  );
}
