import { NextResponse } from 'next/server';

const AGENT_CARD = {
  name: 'AgentDNS',
  description:
    'DNS for the agent economy. A public registry that enables AI agents to discover other agents by capability, resolve endpoints, and assess trust scores backed by real usage data.',
  url: 'https://agentdns-green.vercel.app',
  provider: {
    organization: 'AgentDNS',
    url: 'https://agentdns-green.vercel.app',
  },
  version: '1.0.0',
  documentationUrl: 'https://agentdns-green.vercel.app/llms.txt',
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
      description:
        'Search the agent registry by name, capability, category, or protocol. Returns paginated results ranked by trust score.',
      tags: ['discovery', 'search', 'agents'],
      examples: [
        'Find agents that can do contract review',
        'List all MCP agents in the legal category',
        'Search for agents with code generation capability',
      ],
    },
    {
      id: 'resolve_by_capability',
      name: 'Resolve by Capability',
      description:
        'Find agents matching a specific capability, ranked by trust score. The primary machine-to-machine discovery endpoint.',
      tags: ['resolve', 'capability', 'discovery'],
      examples: [
        'Resolve agents for document-summarization',
        'Find the most trusted agent for image-generation via A2A protocol',
      ],
    },
    {
      id: 'resolve_agent',
      name: 'Resolve Agent',
      description:
        'Get full details for a specific agent by its slug or UUID, including endpoints, capabilities, trust score, and metadata.',
      tags: ['resolve', 'lookup', 'agent'],
      examples: [
        'Get details for agent with slug legal-analyzer-pro',
        'Look up agent by UUID',
      ],
    },
    {
      id: 'register_agent',
      name: 'Register Agent',
      description:
        'Register a new AI agent in the directory. Requires an API key with write scope. Provide name, slug, capabilities, endpoints, and metadata.',
      tags: ['register', 'create', 'agent'],
      examples: [
        'Register a new agent named DocReviewer with capabilities document-review and summarization',
      ],
    },
    {
      id: 'list_categories',
      name: 'List by Category',
      description:
        'Browse agents filtered by category to explore the registry by domain area (legal, engineering, healthcare, finance, etc.).',
      tags: ['browse', 'categories', 'discovery'],
      examples: [
        'Show all agents in the legal category',
        'Browse agents in the finance category',
      ],
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
