import { NextResponse } from 'next/server';

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'AgentDNS API',
    description:
      'DNS for the agent economy. Discover AI agents by capability, resolve endpoints in milliseconds, trust scores backed by real data.',
    version: '1.0.0',
    contact: { url: 'https://agentdns-green.vercel.app' },
  },
  servers: [{ url: 'https://agentdns-green.vercel.app', description: 'Production' }],
  paths: {
    '/api/v1/agents': {
      get: {
        operationId: 'searchAgents',
        summary: 'Search and list agents',
        description: 'Search the agent registry with optional filters. Returns paginated results.',
        tags: ['Agents'],
        security: [{ bearerAuth: [] }, {}],
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string', maxLength: 200 }, description: 'Free-text search across name, tagline, description' },
          { name: 'capability', in: 'query', schema: { type: 'string', maxLength: 200 }, description: 'Capability filter (comma-separated for OR)' },
          { name: 'category', in: 'query', schema: { type: 'string', maxLength: 100 }, description: 'Category filter' },
          { name: 'protocol', in: 'query', schema: { type: 'string', enum: ['a2a', 'mcp', 'rest', 'graphql', 'websocket'] } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'inactive', 'deprecated', 'suspended'], default: 'active' } },
          { name: 'verified', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Filter to verified agents only' },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['relevance', 'trust', 'lookups', 'newest'], default: 'relevance' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
        ],
        responses: {
          '200': {
            description: 'Paginated list of agents',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    agents: { type: 'array', items: { $ref: '#/components/schemas/AgentListItem' } },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '429': { $ref: '#/components/responses/RateLimited' },
        },
      },
      post: {
        operationId: 'registerAgent',
        summary: 'Register a new agent',
        tags: ['Agents'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateAgentInput' } } },
        },
        responses: {
          '201': {
            description: 'Agent created',
            content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/AgentListItem' } } } } },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '409': { description: 'Slug already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '429': { $ref: '#/components/responses/RateLimited' },
        },
      },
    },
    '/api/v1/agents/{id}': {
      get: {
        operationId: 'getAgent',
        summary: 'Resolve agent by ID or slug',
        tags: ['Agents'],
        security: [{ bearerAuth: [] }, {}],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Agent UUID or slug' }],
        responses: {
          '200': {
            description: 'Full agent details',
            content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/Agent' } } } } },
          },
          '404': { description: 'Agent not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '429': { $ref: '#/components/responses/RateLimited' },
        },
      },
      patch: {
        operationId: 'updateAgent',
        summary: 'Update agent (owner only)',
        tags: ['Agents'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Agent UUID or slug' }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateAgentInput' } } },
        },
        responses: {
          '200': {
            description: 'Agent updated',
            content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/Agent' } } } } },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { description: 'Agent not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '409': { description: 'Slug conflict', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '429': { $ref: '#/components/responses/RateLimited' },
        },
      },
      delete: {
        operationId: 'deleteAgent',
        summary: 'Deactivate agent (owner only)',
        description: 'Soft-deletes the agent by setting status to inactive.',
        tags: ['Agents'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Agent UUID or slug' }],
        responses: {
          '200': {
            description: 'Agent deactivated',
            content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object', properties: { message: { type: 'string' } } } } } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { description: 'Agent not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '429': { $ref: '#/components/responses/RateLimited' },
        },
      },
    },
    '/api/v1/resolve': {
      get: {
        operationId: 'resolveByCapability',
        summary: 'Resolve agents by capability',
        description: 'The primary machine-to-machine discovery endpoint. Returns agents matching the given capability, ranked by trust score.',
        tags: ['Resolution'],
        security: [{ bearerAuth: [] }, {}],
        parameters: [
          { name: 'capability', in: 'query', required: true, schema: { type: 'string', minLength: 1, maxLength: 200 }, description: 'Capability to resolve (comma-separated for multi-capability)' },
          { name: 'protocol', in: 'query', schema: { type: 'string', enum: ['a2a', 'mcp', 'rest', 'graphql', 'websocket'] } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 } },
        ],
        responses: {
          '200': {
            description: 'Matching agents ranked by trust score',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    matches: { type: 'array', items: { $ref: '#/components/schemas/ResolveMatch' } },
                    query: { type: 'object' },
                    total: { type: 'integer' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '429': { $ref: '#/components/responses/RateLimited' },
        },
      },
    },
    '/api/v1/health': {
      get: {
        operationId: 'healthCheck',
        summary: 'Health check',
        tags: ['System'],
        responses: {
          '200': {
            description: 'Service health',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    agents_count: { type: 'integer', example: 12 },
                    version: { type: 'string', example: '1.0.0' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        description: 'API key from AgentDNS dashboard. Format: adns_k1_...',
      },
    },
    schemas: {
      CreateAgentInput: {
        type: 'object',
        required: ['slug', 'name'],
        properties: {
          slug: { type: 'string', minLength: 3, maxLength: 80, pattern: '^[a-z0-9][a-z0-9-]*[a-z0-9]$', description: 'Unique URL-safe identifier' },
          name: { type: 'string', minLength: 1, maxLength: 200 },
          tagline: { type: 'string', maxLength: 300 },
          description: { type: 'string', maxLength: 10000 },
          capabilities: { type: 'array', items: { type: 'string', maxLength: 100 }, maxItems: 50, default: [] },
          categories: { type: 'array', items: { type: 'string', maxLength: 100 }, maxItems: 20, default: [] },
          a2a_endpoint: { type: 'string', format: 'uri', maxLength: 500 },
          mcp_server_url: { type: 'string', format: 'uri', maxLength: 500 },
          api_endpoint: { type: 'string', format: 'uri', maxLength: 500 },
          docs_url: { type: 'string', format: 'uri', maxLength: 500 },
          agent_card: { type: 'object', additionalProperties: true, description: 'A2A Agent Card JSON' },
          protocols: { type: 'array', items: { type: 'string', enum: ['a2a', 'mcp', 'rest', 'graphql', 'websocket'] }, default: [] },
          input_formats: { type: 'array', items: { type: 'string', enum: ['text', 'json', 'pdf', 'image', 'audio'] }, default: [] },
          output_formats: { type: 'array', items: { type: 'string', enum: ['text', 'json', 'markdown', 'pdf'] }, default: [] },
          pricing_model: { type: 'string', enum: ['free', 'per-task', 'subscription', 'usage-based', 'custom'] },
          pricing_details: { type: 'string', maxLength: 500 },
          tags: { type: 'array', items: { type: 'string', maxLength: 100 }, maxItems: 50, default: [] },
          metadata: { type: 'object', additionalProperties: true, default: {} },
        },
      },
      UpdateAgentInput: {
        type: 'object',
        description: 'All fields from CreateAgentInput, but all optional.',
        properties: {
          slug: { type: 'string', minLength: 3, maxLength: 80, pattern: '^[a-z0-9][a-z0-9-]*[a-z0-9]$' },
          name: { type: 'string', minLength: 1, maxLength: 200 },
          tagline: { type: 'string', maxLength: 300 },
          description: { type: 'string', maxLength: 10000 },
          capabilities: { type: 'array', items: { type: 'string', maxLength: 100 }, maxItems: 50 },
          categories: { type: 'array', items: { type: 'string', maxLength: 100 }, maxItems: 20 },
          a2a_endpoint: { type: 'string', format: 'uri', maxLength: 500 },
          mcp_server_url: { type: 'string', format: 'uri', maxLength: 500 },
          api_endpoint: { type: 'string', format: 'uri', maxLength: 500 },
          docs_url: { type: 'string', format: 'uri', maxLength: 500 },
          agent_card: { type: 'object', additionalProperties: true },
          protocols: { type: 'array', items: { type: 'string', enum: ['a2a', 'mcp', 'rest', 'graphql', 'websocket'] } },
          input_formats: { type: 'array', items: { type: 'string', enum: ['text', 'json', 'pdf', 'image', 'audio'] } },
          output_formats: { type: 'array', items: { type: 'string', enum: ['text', 'json', 'markdown', 'pdf'] } },
          pricing_model: { type: 'string', enum: ['free', 'per-task', 'subscription', 'usage-based', 'custom'] },
          pricing_details: { type: 'string', maxLength: 500 },
          tags: { type: 'array', items: { type: 'string', maxLength: 100 }, maxItems: 50 },
          metadata: { type: 'object', additionalProperties: true },
        },
      },
      AgentListItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          slug: { type: 'string' },
          name: { type: 'string' },
          tagline: { type: 'string', nullable: true },
          capabilities: { type: 'array', items: { type: 'string' } },
          categories: { type: 'array', items: { type: 'string' } },
          protocols: { type: 'array', items: { type: 'string' } },
          is_verified: { type: 'boolean' },
          trust_score: { type: 'number', minimum: 0, maximum: 1 },
          total_lookups: { type: 'integer' },
          pricing_model: { type: 'string', nullable: true },
          a2a_endpoint: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Agent: {
        allOf: [
          { $ref: '#/components/schemas/AgentListItem' },
          {
            type: 'object',
            properties: {
              description: { type: 'string', nullable: true },
              owner_name: { type: 'string', nullable: true },
              owner_url: { type: 'string', nullable: true },
              version: { type: 'string' },
              status: { type: 'string', enum: ['active', 'inactive', 'deprecated', 'suspended'] },
              mcp_server_url: { type: 'string', nullable: true },
              api_endpoint: { type: 'string', nullable: true },
              docs_url: { type: 'string', nullable: true },
              agent_card: { type: 'object', nullable: true },
              input_formats: { type: 'array', items: { type: 'string' } },
              output_formats: { type: 'array', items: { type: 'string' } },
              pricing_details: { type: 'string', nullable: true },
              tags: { type: 'array', items: { type: 'string' } },
              metadata: { type: 'object' },
              updated_at: { type: 'string', format: 'date-time' },
            },
          },
        ],
      },
      ResolveMatch: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          slug: { type: 'string' },
          name: { type: 'string' },
          trust_score: { type: 'number' },
          a2a_endpoint: { type: 'string', nullable: true },
          mcp_server_url: { type: 'string', nullable: true },
          api_endpoint: { type: 'string', nullable: true },
          pricing_model: { type: 'string', nullable: true },
          capabilities: { type: 'array', items: { type: 'string' } },
          protocols: { type: 'array', items: { type: 'string' } },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
            required: ['code', 'message'],
          },
        },
      },
    },
    responses: {
      ValidationError: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      Unauthorized: { description: 'API key required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      Forbidden: { description: 'Insufficient permissions', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      RateLimited: { description: 'Rate limit exceeded', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
