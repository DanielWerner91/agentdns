'use client';

import { useState, useEffect, useCallback } from 'react';
import { CopyButton } from './CopyButton';

interface ApiKeyDisplay {
  id: string;
  key_prefix: string;
  name: string;
  scopes: string[];
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
}

export function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKeyDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(['read', 'write']);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchKeys = useCallback(async () => {
    const res = await fetch('/api/dashboard/api-keys');
    const result = await res.json();
    if (res.ok) {
      setKeys(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    setError('');
    setCreating(true);

    const res = await fetch('/api/dashboard/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKeyName.trim(), scopes: newKeyScopes }),
    });

    const result = await res.json();
    if (!res.ok) {
      setError(result.error?.message ?? 'Failed to create key');
      setCreating(false);
      return;
    }

    setRevealedKey(result.data.key);
    setNewKeyName('');
    setCreating(false);
    fetchKeys();
  };

  const handleRevoke = async (id: string) => {
    const res = await fetch(`/api/dashboard/api-keys/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchKeys();
    }
  };

  const toggleScope = (scope: string) => {
    setNewKeyScopes((prev) =>
      prev.includes(scope)
        ? prev.filter((s) => s !== scope)
        : [...prev, scope]
    );
  };

  if (loading) {
    return <div className="text-muted text-sm">Loading API keys...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Revealed key banner */}
      {revealedKey && (
        <div className="bg-success/10 border border-success/20 rounded-xl p-4">
          <p className="text-sm font-medium text-success mb-2">
            API key created! Copy it now — you won&apos;t see it again.
          </p>
          <div className="flex items-center gap-2 bg-background rounded-lg px-4 py-3">
            <code className="text-sm font-mono text-foreground flex-1 break-all">{revealedKey}</code>
            <CopyButton text={revealedKey} />
          </div>
          <button
            onClick={() => setRevealedKey(null)}
            className="mt-2 text-xs text-muted hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create new key */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="font-semibold mb-4">Create API Key</h3>
        <div className="space-y-3">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. Production, CI/CD)"
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Scopes:</span>
            {['read', 'write', 'admin'].map((scope) => (
              <button
                key={scope}
                onClick={() => toggleScope(scope)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  newKeyScopes.includes(scope)
                    ? 'bg-accent text-white'
                    : 'bg-background border border-border text-muted'
                }`}
              >
                {scope}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <button
            onClick={handleCreate}
            disabled={creating || !newKeyName.trim() || newKeyScopes.length === 0}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Generate Key'}
          </button>
        </div>
      </div>

      {/* Existing keys */}
      {keys.length > 0 ? (
        <div className="space-y-2">
          {keys.map((apiKey) => (
            <div
              key={apiKey.id}
              className={`flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3 ${
                !apiKey.is_active ? 'opacity-50' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{apiKey.name}</span>
                  <code className="text-xs font-mono text-muted">{apiKey.key_prefix}...</code>
                  {!apiKey.is_active && (
                    <span className="text-xs bg-danger/10 text-danger px-1.5 py-0.5 rounded">Revoked</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span>Scopes: {apiKey.scopes.join(', ')}</span>
                  {apiKey.last_used_at && (
                    <span>Last used: {new Date(apiKey.last_used_at).toLocaleDateString()}</span>
                  )}
                  <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              {apiKey.is_active && (
                <button
                  onClick={() => handleRevoke(apiKey.id)}
                  className="text-xs text-danger hover:text-danger/80 transition-colors ml-4"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">No API keys yet. Create one to use the API programmatically.</p>
      )}
    </div>
  );
}
