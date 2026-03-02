import Link from 'next/link';
import type { AgentListItem } from '@/lib/types';
import { TrustScore } from './TrustScore';
import { ProtocolBadge } from './ProtocolBadge';
import { VerifiedBadge } from './VerifiedBadge';

interface AgentCardProps {
  agent: AgentListItem;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Link
      href={`/agent/${agent.slug}`}
      className="block bg-surface border border-border rounded-xl p-5 hover:border-accent/50 transition-colors group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors truncate">
              {agent.name}
            </h3>
            {agent.is_verified && <VerifiedBadge />}
          </div>
          {agent.tagline && (
            <p className="text-sm text-muted line-clamp-2">{agent.tagline}</p>
          )}
        </div>
        <TrustScore score={agent.trust_score} />
      </div>

      {/* Capabilities */}
      {agent.capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {agent.capabilities.slice(0, 4).map((cap) => (
            <span
              key={cap}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs font-medium"
            >
              {cap}
            </span>
          ))}
          {agent.capabilities.length > 4 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-hover text-muted text-xs">
              +{agent.capabilities.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Bottom row: protocols + stats */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          {agent.protocols.map((p) => (
            <ProtocolBadge key={p} protocol={p} />
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          {agent.pricing_model && (
            <span className="capitalize">{agent.pricing_model}</span>
          )}
          <span>{agent.total_lookups.toLocaleString()} lookups</span>
        </div>
      </div>
    </Link>
  );
}
