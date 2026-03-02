export class AgentDNSClient {
  readonly baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  private headers(requireAuth = false): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) {
      h['Authorization'] = `Bearer ${this.apiKey}`;
    } else if (requireAuth) {
      throw new Error(
        'API key required for this operation. Set AGENTDNS_API_KEY environment variable.'
      );
    }
    return h;
  }

  async searchAgents(params: Record<string, string>): Promise<unknown> {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${this.baseUrl}/api/v1/agents?${qs}`, {
      headers: this.headers(),
    });
    return res.json();
  }

  async getAgent(idOrSlug: string): Promise<unknown> {
    const res = await fetch(
      `${this.baseUrl}/api/v1/agents/${encodeURIComponent(idOrSlug)}`,
      { headers: this.headers() }
    );
    return res.json();
  }

  async resolveByCapability(params: Record<string, string>): Promise<unknown> {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${this.baseUrl}/api/v1/resolve?${qs}`, {
      headers: this.headers(),
    });
    return res.json();
  }

  async registerAgent(body: Record<string, unknown>): Promise<unknown> {
    const res = await fetch(`${this.baseUrl}/api/v1/agents`, {
      method: 'POST',
      headers: this.headers(true),
      body: JSON.stringify(body),
    });
    return res.json();
  }
}
