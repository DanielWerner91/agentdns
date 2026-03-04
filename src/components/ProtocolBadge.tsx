const PROTOCOL_COLORS: Record<string, string> = {
  a2a: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  mcp: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  rest: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  graphql: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  websocket: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

interface ProtocolBadgeProps {
  protocol: string;
}

export function ProtocolBadge({ protocol }: ProtocolBadgeProps) {
  const colors = PROTOCOL_COLORS[protocol] ?? 'bg-surface text-muted border-border';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium uppercase border ${colors}`}
    >
      {protocol}
    </span>
  );
}
