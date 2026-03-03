const REQUEST_TIMEOUT_MS = 30_000;

export class AgentDNSClient {
  readonly baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    const url = baseUrl.replace(/\/$/, '');
    if (!/^https?:\/\//i.test(url)) {
      throw new Error('AGENTDNS_API_URL must start with http:// or https://');
    }
    this.baseUrl = url;
    this.apiKey = apiKey;
  }

  private headers(requireAuth = false): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) {
      h['Authorization'] = `Bearer ${this.apiKey}`;
    } else if (requireAuth) {
      throw new Error('API key required for this operation.');
    }
    return h;
  }

  private async request(url: string, init?: RequestInit): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }
      return await res.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  async searchAgents(params: Record<string, string>): Promise<unknown> {
    const qs = new URLSearchParams(params).toString();
    return this.request(`${this.baseUrl}/api/v1/agents?${qs}`, {
      headers: this.headers(),
    });
  }

  async getAgent(idOrSlug: string): Promise<unknown> {
    return this.request(
      `${this.baseUrl}/api/v1/agents/${encodeURIComponent(idOrSlug)}`,
      { headers: this.headers() }
    );
  }

  async resolveByCapability(params: Record<string, string>): Promise<unknown> {
    const qs = new URLSearchParams(params).toString();
    return this.request(`${this.baseUrl}/api/v1/resolve?${qs}`, {
      headers: this.headers(),
    });
  }

  async registerAgent(body: Record<string, unknown>): Promise<unknown> {
    return this.request(`${this.baseUrl}/api/v1/agents`, {
      method: 'POST',
      headers: this.headers(true),
      body: JSON.stringify(body),
    });
  }

  async getAgentCard(): Promise<unknown> {
    return this.request(`${this.baseUrl}/.well-known/agent.json`);
  }
}
