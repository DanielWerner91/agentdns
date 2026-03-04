'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Agent } from '@/lib/types';
import { TrustScore } from './TrustScore';
import { VerifiedBadge } from './VerifiedBadge';

export function DashboardAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    const res = await fetch('/api/dashboard/agents');
    const result = await res.json();
    if (res.ok) {
      setAgents(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleDeactivate = async (id: string) => {
    if (!confirm('Deactivate this agent? It will no longer appear in search results.')) return;

    const res = await fetch(`/api/dashboard/agents/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchAgents();
    }
  };

  const handleReactivate = async (id: string) => {
    const res = await fetch(`/api/dashboard/agents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    });
    if (res.ok) {
      fetchAgents();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted text-sm py-8">
        <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        Loading your agents...
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="text-center py-12 bg-surface/60 border border-border rounded-xl">
        <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
        <p className="text-muted text-sm mb-4">Register your first agent to get started.</p>
        <Link
          href="/register"
          className="inline-block bg-gradient-to-r from-accent to-accent-2 hover:from-accent-hover hover:to-accent-2-hover text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
        >
          Register Agent
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {agents.map((agent) => (
        <div
          key={agent.id}
          className={`bg-surface/60 border border-border rounded-xl p-5 card-lift glow-border ${
            agent.status !== 'active' ? 'opacity-60' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/agent/${agent.slug}`}
                  className="font-semibold hover:text-accent transition-colors duration-150 cursor-pointer"
                >
                  {agent.name}
                </Link>
                {agent.is_verified && <VerifiedBadge />}
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    agent.status === 'active'
                      ? 'bg-success/10 text-success'
                      : agent.status === 'deprecated'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-danger/10 text-danger'
                  }`}
                >
                  {agent.status}
                </span>
              </div>
              {agent.tagline && (
                <p className="text-sm text-muted mb-2">{agent.tagline}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted">
                <span>{agent.total_lookups.toLocaleString()} lookups</span>
                <span>v{agent.version}</span>
                <span>Created {new Date(agent.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrustScore score={agent.trust_score} />
              <div className="flex items-center gap-2">
                <Link
                  href={`/agent/${agent.slug}`}
                  className="text-xs text-muted hover:text-foreground transition-colors duration-150 px-2 py-1 cursor-pointer"
                >
                  View
                </Link>
                {agent.status === 'active' ? (
                  <button
                    onClick={() => handleDeactivate(agent.id)}
                    className="text-xs text-danger hover:text-danger/80 transition-colors duration-150 px-2 py-1 cursor-pointer"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => handleReactivate(agent.id)}
                    className="text-xs text-success hover:text-success/80 transition-colors duration-150 px-2 py-1 cursor-pointer"
                  >
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
