export interface Agent {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  owner_id: string;
  owner_name: string | null;
  owner_url: string | null;
  version: string;
  status: 'active' | 'inactive' | 'deprecated' | 'suspended';
  capabilities: string[];
  categories: string[];
  a2a_endpoint: string | null;
  mcp_server_url: string | null;
  api_endpoint: string | null;
  docs_url: string | null;
  agent_card: Record<string, unknown> | null;
  protocols: string[];
  input_formats: string[];
  output_formats: string[];
  is_verified: boolean;
  trust_score: number;
  total_lookups: number;
  pricing_model: string | null;
  pricing_details: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AgentListItem {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  capabilities: string[];
  categories: string[];
  protocols: string[];
  is_verified: boolean;
  trust_score: number;
  total_lookups: number;
  pricing_model: string | null;
  a2a_endpoint: string | null;
  created_at: string;
}

export interface ApiKey {
  id: string;
  owner_id: string;
  key_hash: string;
  key_prefix: string;
  name: string;
  scopes: string[];
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface LookupLogEntry {
  id: string;
  agent_id: string | null;
  query_type: string;
  query_params: Record<string, unknown> | null;
  requester_api_key_prefix: string | null;
  requester_ip: string | null;
  created_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ResolveMatch {
  id: string;
  slug: string;
  name: string;
  trust_score: number;
  a2a_endpoint: string | null;
  mcp_server_url: string | null;
  api_endpoint: string | null;
  pricing_model: string | null;
  capabilities: string[];
  protocols: string[];
}

export interface ResolveResponse {
  matches: ResolveMatch[];
  query: Record<string, string>;
  total: number;
}
