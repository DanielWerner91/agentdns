import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { AgentDNSClient } from './client.js';

export function registerTools(server: Server, client: AgentDNSClient) {
  server.setRequestHandler(
    ListToolsRequestSchema,
    async () => ({
      tools: [
        {
          name: 'search_agents',
          description:
            'Search for AI agents by keyword, category, protocol, or capability. Returns a paginated list of matching agents.',
          inputSchema: {
            type: 'object',
            properties: {
              q: { type: 'string', description: 'Free-text search query' },
              category: {
                type: 'string',
                description: 'Filter by category (e.g. "code-generation", "data-analysis")',
              },
              protocol: {
                type: 'string',
                description: 'Filter by protocol (e.g. "a2a", "mcp", "rest")',
              },
              capability: {
                type: 'string',
                description: 'Filter by capability keyword',
              },
              verified: {
                type: 'string',
                enum: ['true', 'false'],
                description: 'Filter to verified agents only',
              },
              sort: {
                type: 'string',
                enum: ['trust_score', 'created_at', 'total_lookups'],
                description: 'Sort field (default: trust_score)',
              },
              order: {
                type: 'string',
                enum: ['asc', 'desc'],
                description: 'Sort order (default: desc)',
              },
              limit: {
                type: 'string',
                description: 'Number of results (default: 20, max: 100)',
              },
              offset: {
                type: 'string',
                description: 'Pagination offset (default: 0)',
              },
            },
          },
        },
        {
          name: 'get_agent',
          description:
            'Get full details for a single agent by its ID or slug. Returns all fields including description, endpoints, pricing, and metadata.',
          inputSchema: {
            type: 'object',
            properties: {
              id_or_slug: {
                type: 'string',
                description: 'Agent UUID or slug',
              },
            },
            required: ['id_or_slug'],
          },
        },
        {
          name: 'resolve_by_capability',
          description:
            'Find the best agents for a specific task or capability. Returns ranked matches with trust scores and connection endpoints.',
          inputSchema: {
            type: 'object',
            properties: {
              capability: {
                type: 'string',
                description: 'The capability or task description to resolve',
              },
              protocol: {
                type: 'string',
                description: 'Preferred protocol (a2a, mcp, rest)',
              },
              min_trust: {
                type: 'string',
                description: 'Minimum trust score 0-100 (default: 0)',
              },
              limit: {
                type: 'string',
                description: 'Max results (default: 5)',
              },
            },
            required: ['capability'],
          },
        },
        {
          name: 'register_agent',
          description:
            'Register a new AI agent in the AgentDNS directory. Requires an API key with write scope.',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Agent display name' },
              slug: {
                type: 'string',
                description: 'URL-friendly identifier (lowercase, hyphens)',
              },
              description: {
                type: 'string',
                description: 'Full description of the agent',
              },
              tagline: {
                type: 'string',
                description: 'Short one-line summary',
              },
              capabilities: {
                type: 'array',
                items: { type: 'string' },
                description: 'List of capabilities',
              },
              categories: {
                type: 'array',
                items: { type: 'string' },
                description: 'Category tags',
              },
              protocols: {
                type: 'array',
                items: { type: 'string' },
                description: 'Supported protocols (a2a, mcp, rest)',
              },
              a2a_endpoint: {
                type: 'string',
                description: 'A2A protocol endpoint URL',
              },
              mcp_server_url: {
                type: 'string',
                description: 'MCP server URL',
              },
              api_endpoint: {
                type: 'string',
                description: 'REST API endpoint URL',
              },
              docs_url: {
                type: 'string',
                description: 'Documentation URL',
              },
              version: { type: 'string', description: 'Agent version' },
              pricing_model: {
                type: 'string',
                enum: ['free', 'freemium', 'paid', 'enterprise'],
                description: 'Pricing model',
              },
            },
            required: ['name', 'slug', 'capabilities', 'protocols'],
          },
        },
        {
          name: 'list_categories',
          description:
            'List all available agent categories with agent counts. Useful for browsing the directory.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_agent_card',
          description:
            'Fetch the A2A Agent Card for AgentDNS itself. Returns the /.well-known/agent.json discovery metadata.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    })
  );

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request) => {
      const { name } = request.params;
      const args = (request.params.arguments ?? {}) as Record<string, unknown>;

      try {
        switch (name) {
          case 'search_agents': {
            const params: Record<string, string> = {};
            for (const [k, v] of Object.entries(args || {})) {
              if (v !== undefined && v !== null && v !== '') {
                params[k] = String(v);
              }
            }
            const result = await client.searchAgents(params);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
          }

          case 'get_agent': {
            const result = await client.getAgent(String(args.id_or_slug));
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
          }

          case 'resolve_by_capability': {
            const params: Record<string, string> = {};
            for (const [k, v] of Object.entries(args || {})) {
              if (v !== undefined && v !== null && v !== '') {
                params[k] = String(v);
              }
            }
            const result = await client.resolveByCapability(params);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
          }

          case 'register_agent': {
            const result = await client.registerAgent(args || {});
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
          }

          case 'list_categories': {
            const result = await client.searchAgents({});
            // Extract unique categories from all agents
            const agents = (result as any)?.data ?? (result as any) ?? [];
            const catCounts: Record<string, number> = {};
            for (const agent of Array.isArray(agents) ? agents : []) {
              for (const cat of agent.categories ?? []) {
                catCounts[cat] = (catCounts[cat] || 0) + 1;
              }
            }
            const categories = Object.entries(catCounts)
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count);
            return {
              content: [{ type: 'text', text: JSON.stringify({ categories }, null, 2) }],
            };
          }

          case 'get_agent_card': {
            const res = await fetch(
              `${client.baseUrl}/.well-known/agent.json`
            );
            const card = await res.json();
            return { content: [{ type: 'text', text: JSON.stringify(card, null, 2) }] };
          }

          default:
            return {
              content: [{ type: 'text', text: `Unknown tool: ${name}` }],
              isError: true,
            };
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Error: ${err.message}` }],
          isError: true,
        };
      }
    }
  );
}
