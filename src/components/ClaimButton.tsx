'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

interface ClaimButtonProps {
  agentId: string;
  agentName: string;
  isAuthenticated: boolean;
}

export function ClaimButton({ agentId, agentName, isAuthenticated }: ClaimButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const handleClaim = async () => {
    if (!isAuthenticated) {
      signIn('github', { callbackUrl: window.location.href });
      return;
    }

    setState('loading');
    try {
      const res = await fetch(`/api/dashboard/agents/${agentId}/claim`, {
        method: 'POST',
      });
      if (res.ok) {
        setState('done');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const data = await res.json();
        console.error('Claim failed:', data);
        setState('error');
      }
    } catch {
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <div className="w-full py-2.5 px-4 bg-success/10 border border-success/20 text-success rounded-lg text-sm text-center font-medium">
        Claimed! Refreshing...
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="w-full py-2.5 px-4 bg-danger/10 border border-danger/20 text-danger rounded-lg text-sm text-center">
        Claim failed. Try again.
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <p className="text-xs text-muted uppercase tracking-wider mb-1">Listing Type</p>
      <p className="text-sm mb-3">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-hover border border-border text-xs font-medium text-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Community Listed
        </span>
      </p>
      <p className="text-xs text-muted mb-3">
        This agent was listed by the AgentDNS community. If you own {agentName}, you can claim it.
      </p>
      <button
        onClick={handleClaim}
        disabled={state === 'loading'}
        className="w-full py-2 px-4 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
      >
        {state === 'loading' ? 'Claiming...' : isAuthenticated ? 'Claim This Agent' : 'Sign in to Claim'}
      </button>
    </div>
  );
}
