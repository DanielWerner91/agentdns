'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  placeholder = 'Search agents by name or capability...',
  className = '',
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set('q', query.trim());
      } else {
        params.delete('q');
      }
      params.delete('page');
      router.push(`/explore?${params.toString()}`);
    },
    [query, searchParams, router]
  );

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex items-center bg-surface border border-border rounded-xl overflow-hidden focus-within:border-accent transition-colors">
        <div className="pl-4 text-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-4 py-3 text-foreground placeholder:text-muted outline-none"
        />
        <button
          type="submit"
          className="bg-accent hover:bg-accent-hover text-white px-6 py-3 font-medium text-sm transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
