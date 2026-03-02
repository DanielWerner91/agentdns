const PROTOCOL_COLORS: Record<string, string> = {
  a2a: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  mcp: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  rest: 'bg-green-500/10 text-green-400 border-green-500/20',
  graphql: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  websocket: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
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
