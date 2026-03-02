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

export interface Agent extends AgentListItem {
  description: string | null;
  owner_name: string | null;
  owner_url: string | null;
  version: string;
  status: string;
  mcp_server_url: string | null;
  api_endpoint: string | null;
  docs_url: string | null;
  agent_card: Record<string, unknown> | null;
  input_formats: string[];
  output_formats: string[];
  pricing_details: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  updated_at: string;
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
