'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  size?: 'default' | 'large';
}

export function SearchBar({
  placeholder = 'Search agents by name or capability...',
  className = '',
  size = 'default',
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

  const isLarge = size === 'large';

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className={`flex items-center bg-surface/80 border border-border rounded-xl overflow-hidden search-glow transition-all duration-200 ${isLarge ? 'glow-cyan' : ''}`}>
        <div className={`text-muted ${isLarge ? 'pl-6' : 'pl-4'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width={isLarge ? 22 : 18} height={isLarge ? 22 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 bg-transparent text-foreground placeholder:text-muted outline-none ${
            isLarge ? 'px-5 py-5 text-lg' : 'px-4 py-3 text-sm'
          }`}
        />
        <button
          type="submit"
          className={`bg-gradient-to-r from-accent to-accent-2 hover:from-accent-hover hover:to-accent-2-hover text-white font-medium transition-all duration-200 cursor-pointer ${
            isLarge ? 'px-8 py-5 text-base' : 'px-6 py-3 text-sm'
          }`}
        >
          Search
        </button>
      </div>
    </form>
  );
}
