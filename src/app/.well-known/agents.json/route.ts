import { NextResponse } from 'next/server';

const BASE_URL = 'https://agent-dns.tech';

// AgentDNS's own .well-known/agents.json — eating our own dog food
const AGENTS_MANIFEST = {
  schema_version: '0.1.0',
  site: BASE_URL,
  agents: [
    {
      name: 'AgentDNS Registry',
      slug: 'agentdns',
      description:
        'Open discovery registry for AI agents. Search and resolve agents by capability, protocol, and trust score.',
      capabilities: ['agent-discovery', 'agent-search', 'agent-resolution', 'registry'],
      protocols: ['a2a', 'rest', 'mcp'],
      endpoints: {
        a2a: `${BASE_URL}/.well-known/agent.json`,
        rest: `${BASE_URL}/api/v1`,
        mcp: 'npx @agentdns/mcp-server',
      },
      authentication: {
        read: 'none',
        write: 'bearer',
      },
      docs: `${BASE_URL}/docs`,
    },
  ],
};

export async function GET() {
  return NextResponse.json(AGENTS_MANIFEST, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Content-Type': 'application/json',
    },
  });
}
