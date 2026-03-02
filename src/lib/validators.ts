import { z } from 'zod';

export const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(80, 'Slug must be at most 80 characters')
  .regex(
    /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
    'Slug must be lowercase alphanumeric with hyphens, and cannot start or end with a hyphen'
  );

export const createAgentSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1).max(200),
  tagline: z.string().max(300).optional(),
  description: z.string().max(10000).optional(),
  capabilities: z.array(z.string().max(100)).max(50).default([]),
  categories: z.array(z.string().max(100)).max(20).default([]),
  a2a_endpoint: z.string().url().max(500).optional(),
  mcp_server_url: z.string().url().max(500).optional(),
  api_endpoint: z.string().url().max(500).optional(),
  docs_url: z.string().url().max(500).optional(),
  agent_card: z.record(z.string(), z.unknown()).optional(),
  protocols: z
    .array(z.enum(['a2a', 'mcp', 'rest', 'graphql', 'websocket']))
    .default([]),
  input_formats: z
    .array(z.enum(['text', 'json', 'pdf', 'image', 'audio']))
    .default([]),
  output_formats: z
    .array(z.enum(['text', 'json', 'markdown', 'pdf']))
    .default([]),
  pricing_model: z
    .enum(['free', 'per-task', 'subscription', 'usage-based', 'custom'])
    .optional(),
  pricing_details: z.string().max(500).optional(),
  tags: z.array(z.string().max(100)).max(50).default([]),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateAgentSchema = createAgentSchema.partial();

export const searchParamsSchema = z.object({
  q: z.string().max(200).optional(),
  capability: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  protocol: z.enum(['a2a', 'mcp', 'rest', 'graphql', 'websocket']).optional(),
  status: z
    .enum(['active', 'inactive', 'deprecated', 'suspended'])
    .default('active'),
  verified: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  sort: z.enum(['relevance', 'trust', 'lookups', 'newest']).default('relevance'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const resolveParamsSchema = z.object({
  capability: z.string().min(1).max(200),
  protocol: z.enum(['a2a', 'mcp', 'rest', 'graphql', 'websocket']).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.enum(['read', 'write'])).min(1).default(['read']),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type SearchParams = z.infer<typeof searchParamsSchema>;
export type ResolveParams = z.infer<typeof resolveParamsSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
