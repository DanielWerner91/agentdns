import { NextResponse } from 'next/server';

const BASE_URL = 'https://agent-dns.tech';

const AGENT_CARD = {
  name: 'AgentDNS',
  description:
    'DNS for the agent economy. A public registry that enables AI agents to discover other agents by capability, resolve endpoints, and assess trust scores backed by real usage data.',
  url: BASE_URL,
  provider: {
    organization: 'AgentDNS',
    url: BASE_URL,
  },
  version: '1.0.0',
  documentationUrl: `${BASE_URL}/llms.txt`,
  capabilities: {
    streaming: false,
    pushNotifications: false,
    stateTransitionHistory: false,
  },
  authentication: {
    schemes: ['bearer'],
    credentials:
      'API key required for write operations. Obtain at /dashboard after signing in with GitHub. Format: adns_k1_...',
  },
  defaultInputModes: ['application/json'],
  defaultOutputModes: ['application/json'],
  skills: [
    {
      id: 'search_agents',
      name: 'Search Agents',
      description: 'Search the agent registry by name, capability, category, or protocol.',
      tags: ['discovery', 'search', 'agents'],
      examples: ['Find agents that can do contract review', 'List all MCP agents'],
    },
    {
      id: 'resolve_by_capability',
      name: 'Resolve by Capability',
      description: 'Find agents matching a specific capability, ranked by trust score.',
      tags: ['resolve', 'capability', 'discovery'],
      examples: ['Resolve agents for document-summarization'],
    },
    {
      id: 'resolve_agent',
      name: 'Resolve Agent',
      description: 'Get full details for a specific agent by its slug or UUID.',
      tags: ['resolve', 'lookup', 'agent'],
      examples: ['Get details for agent playwright-mcp'],
    },
    {
      id: 'register_agent',
      name: 'Register Agent',
      description: 'Register a new AI agent in the directory. Requires API key with write scope.',
      tags: ['register', 'create', 'agent'],
      examples: ['Register DocReviewer with capabilities document-review, summarization'],
    },
    {
      id: 'list_categories',
      name: 'List by Category',
      description: 'Browse agents filtered by category.',
      tags: ['browse', 'categories', 'discovery'],
      examples: ['Show all agents in the developer-tools category'],
    },
  ],
};

export async function GET() {
  return NextResponse.json(AGENT_CARD, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
