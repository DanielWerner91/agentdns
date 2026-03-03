'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Prefill {
  name: string; slug: string; tagline: string; description: string;
  capabilities: string; protocols: string[]; a2a_endpoint: string | null;
  mcp_server_url: string | null; api_endpoint: string | null; docs_url: string;
}

export function GitHubImporter() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prefill, setPrefill] = useState<Prefill | null>(null);
  const [stars, setStars] = useState(0);

  const handleFetch = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(''); setPrefill(null);
    try {
      const res = await fetch('/api/dashboard/import-github', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error?.message ?? 'Failed to fetch repo'); return; }
      setPrefill(data.prefill);
      setStars(data.github?.stars ?? 0);
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  };

  const handleRegister = () => {
    if (!prefill) return;
    // Store prefill in sessionStorage, redirect to /register
    sessionStorage.setItem('agentdns_prefill', JSON.stringify(prefill));
    router.push('/register?prefill=1');
  };

  const inp = "w-full bg-surface border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted outline-none focus:border-accent text-sm";

  return (
    <div className="space-y-6">
      {/* URL input */}
      <div className="flex gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
          placeholder="https://github.com/owner/my-mcp-server"
          className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted outline-none focus:border-accent text-sm font-mono"
        />
        <button
          onClick={handleFetch}
          disabled={loading || !url.trim()}
          className="px-5 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? 'Fetching...' : 'Fetch Repo'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">{error}</div>
      )}

      {/* Preview */}
      {prefill && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-success">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            Repo found{stars > 0 ? ` · ★ ${stars.toLocaleString()} stars` : ''}
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-sm text-muted uppercase tracking-wider">Pre-populated data</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted mb-1">Name</label>
                <input type="text" value={prefill.name} readOnly className={`${inp} opacity-80`} />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Slug</label>
                <input type="text" value={prefill.slug} readOnly className={`${inp} font-mono opacity-80`} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Tagline</label>
              <input type="text" value={prefill.tagline} readOnly className={`${inp} opacity-80`} />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Capabilities (auto-detected)</label>
              <input type="text" value={prefill.capabilities} readOnly className={`${inp} opacity-80`} />
            </div>
            {(prefill.mcp_server_url || prefill.a2a_endpoint) && (
              <div>
                <label className="block text-xs text-muted mb-1">
                  {prefill.mcp_server_url ? 'MCP Server URL' : 'A2A Endpoint'}
                </label>
                <input type="text" value={prefill.mcp_server_url ?? prefill.a2a_endpoint ?? ''} readOnly className={`${inp} font-mono opacity-80`} />
              </div>
            )}
          </div>

          <p className="text-xs text-muted">
            You can review and edit all fields before publishing.
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleRegister}
              className="flex-1 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
            >
              Continue to Register →
            </button>
            <button
              onClick={() => { setPrefill(null); setUrl(''); }}
              className="px-5 py-3 border border-border rounded-lg text-sm text-muted hover:text-foreground transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      {!prefill && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Tips for best results</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">→</span>
              Add an <code className="font-mono text-xs bg-surface px-1 rounded">agentdns.json</code> to your repo root for perfect auto-fill
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">→</span>
              A clear first line in your README becomes the tagline
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">→</span>
              GitHub topics and package.json keywords are used for capability detection
            </li>
          </ul>
          <div className="mt-4 bg-surface border border-border rounded-lg p-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">agentdns.json format</p>
            <pre className="text-xs font-mono text-muted overflow-x-auto">{`{
  "slug": "my-mcp-server",
  "name": "My MCP Server",
  "tagline": "Does amazing things",
  "capabilities": ["code-generation", "testing"],
  "protocols": ["mcp"],
  "endpoints": {
    "mcp": "https://my-server.example.com"
  }
}`}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
