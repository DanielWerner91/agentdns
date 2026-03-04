'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const CATEGORIES = [
  'data', 'engineering', 'developer-tools', 'infrastructure', 'productivity',
  'content', 'finance', 'support', 'sales', 'security',
  'healthcare', 'education', 'legal', 'design-creative',
];

const PROTOCOLS = ['a2a', 'mcp', 'rest', 'graphql', 'websocket'];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'trust', label: 'Trust Score' },
  { value: 'lookups', label: 'Most Queried' },
  { value: 'newest', label: 'Newest' },
];

export function ExploreFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get('category') ?? '';
  const activeProtocol = searchParams.get('protocol') ?? '';
  const activeSort = searchParams.get('sort') ?? 'relevance';
  const verifiedOnly = searchParams.get('verified') === 'true';

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.push(`/explore?${params.toString()}`);
    },
    [searchParams, router]
  );

  const toggleVerified = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (verifiedOnly) {
      params.delete('verified');
    } else {
      params.set('verified', 'true');
    }
    params.delete('page');
    router.push(`/explore?${params.toString()}`);
  }, [searchParams, router, verifiedOnly]);

  return (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Sort by</h4>
        <select
          value={activeSort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Verified */}
      <div>
        <button
          onClick={toggleVerified}
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg border text-sm transition-colors ${
            verifiedOnly
              ? 'bg-accent/10 border-accent/30 text-accent'
              : 'bg-surface border-border text-muted hover:text-foreground'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Verified only
        </button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Category</h4>
        <div className="space-y-1">
          <button
            onClick={() => updateParam('category', '')}
            className={`block w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
              !activeCategory ? 'text-accent bg-accent/10' : 'text-muted hover:text-foreground'
            }`}
          >
            All categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => updateParam('category', activeCategory === cat ? '' : cat)}
              className={`block w-full text-left px-3 py-1.5 rounded text-sm capitalize transition-colors ${
                activeCategory === cat ? 'text-accent bg-accent/10' : 'text-muted hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Protocols */}
      <div>
        <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Protocol</h4>
        <div className="space-y-1">
          <button
            onClick={() => updateParam('protocol', '')}
            className={`block w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
              !activeProtocol ? 'text-accent bg-accent/10' : 'text-muted hover:text-foreground'
            }`}
          >
            All protocols
          </button>
          {PROTOCOLS.map((proto) => (
            <button
              key={proto}
              onClick={() => updateParam('protocol', activeProtocol === proto ? '' : proto)}
              className={`block w-full text-left px-3 py-1.5 rounded text-sm uppercase font-mono transition-colors ${
                activeProtocol === proto ? 'text-accent bg-accent/10' : 'text-muted hover:text-foreground'
              }`}
            >
              {proto}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
