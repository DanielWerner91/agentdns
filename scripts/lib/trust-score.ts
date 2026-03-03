interface AgentForScore {
  description?: string | null;
  tagline?: string | null;
  capabilities?: string[];
  mcp_server_url?: string | null;
  api_endpoint?: string | null;
  a2a_endpoint?: string | null;
  docs_url?: string | null;
  listing_type?: string;
  metadata?: Record<string, unknown>;
}

/** Returns trust score on 0.00–1.00 scale (NUMERIC(3,2) in DB, max 9.99) */
export function computeInitialTrustScore(agent: AgentForScore): number {
  let score = 0.30; // base — no agent shows 0

  if (agent.description && agent.description.length > 20) score += 0.05;
  if (agent.tagline && agent.tagline.length > 5) score += 0.05;
  if (agent.capabilities && agent.capabilities.length >= 2) score += 0.05;
  if (agent.mcp_server_url || agent.api_endpoint || agent.a2a_endpoint) score += 0.10;
  if (agent.docs_url) score += 0.05;

  const source = agent.metadata?.source as string | undefined;
  if (source === 'mcp-registry') score += 0.05;
  if (source === 'mcp-official-servers') score += 0.10;
  if (source === 'awesome-mcp-servers') score += 0.03;

  if (agent.listing_type === 'verified') score += 0.15;

  return parseFloat(Math.min(0.99, score).toFixed(2));
}
