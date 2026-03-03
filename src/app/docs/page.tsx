import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'API Documentation — AgentDNS',
  description: 'Complete API reference for AgentDNS. Search, resolve, and register AI agents programmatically.',
};

const BASE_URL = 'https://agent-dns.tech';

interface EndpointProps {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  auth: 'None' | 'API Key (read)' | 'API Key (write)' | 'GitHub OAuth';
  description: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  body?: { name: string; type: string; required: boolean; description: string }[];
  response: string;
  curl: string;
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  POST: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PATCH: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const ENDPOINTS: EndpointProps[] = [
  {
    method: 'GET',
    path: '/api/v1/agents',
    auth: 'None',
    description: 'Search and list agents with optional filters. Returns paginated results sorted by trust score.',
    params: [
      { name: 'q', type: 'string', required: false, description: 'Full-text search across name, tagline, description' },
      { name: 'capability', type: 'string', required: false, description: 'Filter by capability tag (comma-separated for OR)' },
      { name: 'category', type: 'string', required: false, description: 'Filter by category' },
      { name: 'protocol', type: 'a2a | mcp | rest | graphql | websocket', required: false, description: 'Filter by protocol' },
      { name: 'sort', type: 'relevance | trust | lookups | newest', required: false, description: 'Sort order (default: relevance)' },
      { name: 'page', type: 'integer', required: false, description: 'Page number (default: 1)' },
      { name: 'limit', type: 'integer', required: false, description: 'Results per page, max 100 (default: 20)' },
    ],
    response: '{ agents: AgentListItem[], total: number, page: number, limit: number }',
    curl: `curl "${BASE_URL}/api/v1/agents?capability=browser-automation&protocol=mcp"`,
  },
  {
    method: 'POST',
    path: '/api/v1/agents',
    auth: 'API Key (write)',
    description: 'Register a new agent in the directory. Requires an API key with write scope.',
    body: [
      { name: 'slug', type: 'string', required: true, description: '3-80 chars, lowercase alphanumeric with hyphens' },
      { name: 'name', type: 'string', required: true, description: 'Agent display name, max 200 chars' },
      { name: 'tagline', type: 'string', required: false, description: 'One-line description, max 300 chars' },
      { name: 'description', type: 'string', required: false, description: 'Full description, max 10,000 chars' },
      { name: 'capabilities', type: 'string[]', required: false, description: 'Array of capability tags' },
      { name: 'protocols', type: 'string[]', required: false, description: 'Supported protocols: a2a, mcp, rest, graphql, websocket' },
      { name: 'a2a_endpoint', type: 'URL', required: false, description: 'A2A agent card URL' },
      { name: 'mcp_server_url', type: 'URL', required: false, description: 'MCP server URL' },
      { name: 'api_endpoint', type: 'URL', required: false, description: 'REST API endpoint URL' },
      { name: 'docs_url', type: 'URL', required: false, description: 'Documentation URL' },
      { name: 'pricing_model', type: 'string', required: false, description: 'free | per-task | subscription | usage-based | custom' },
    ],
    response: '{ data: Agent }',
    curl: `curl -X POST "${BASE_URL}/api/v1/agents" \\
  -H "Authorization: Bearer adns_k1_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"slug":"my-agent","name":"My Agent","capabilities":["summarization"],"protocols":["mcp"]}'`,
  },
  {
    method: 'GET',
    path: '/api/v1/agents/{slug}',
    auth: 'None',
    description: 'Resolve a specific agent by slug or UUID. Returns full agent details including endpoints, capabilities, and trust score.',
    response: '{ data: Agent }',
    curl: `curl "${BASE_URL}/api/v1/agents/playwright-mcp"`,
  },
  {
    method: 'PATCH',
    path: '/api/v1/agents/{slug}',
    auth: 'API Key (write)',
    description: 'Update an existing agent. Only the owner (matching owner_id) can update. All fields are optional.',
    body: [
      { name: 'name', type: 'string', required: false, description: 'Agent display name' },
      { name: 'tagline', type: 'string', required: false, description: 'One-line description' },
      { name: 'capabilities', type: 'string[]', required: false, description: 'Replace capabilities array' },
      { name: 'status', type: 'string', required: false, description: 'active | inactive | deprecated | suspended' },
    ],
    response: '{ data: Agent }',
    curl: `curl -X PATCH "${BASE_URL}/api/v1/agents/my-agent" \\
  -H "Authorization: Bearer adns_k1_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"tagline":"Updated tagline"}'`,
  },
  {
    method: 'DELETE',
    path: '/api/v1/agents/{slug}',
    auth: 'API Key (write)',
    description: 'Soft-delete an agent (sets status to inactive). Only the owner can delete.',
    response: '{ data: { message: string } }',
    curl: `curl -X DELETE "${BASE_URL}/api/v1/agents/my-agent" \\
  -H "Authorization: Bearer adns_k1_YOUR_KEY"`,
  },
  {
    method: 'GET',
    path: '/api/v1/resolve',
    auth: 'None',
    description: 'Primary machine-to-machine discovery endpoint. Resolve agents by capability, optionally filtered by protocol. Returns results ranked by trust score.',
    params: [
      { name: 'capability', type: 'string', required: true, description: 'Capability to resolve (comma-separated for multiple)' },
      { name: 'protocol', type: 'string', required: false, description: 'Filter by protocol: a2a, mcp, rest, graphql, websocket' },
      { name: 'limit', type: 'integer', required: false, description: 'Max results, 1-50 (default: 10)' },
    ],
    response: '{ matches: ResolveMatch[], query: object, total: number }',
    curl: `curl "${BASE_URL}/api/v1/resolve?capability=browser-automation&protocol=mcp&limit=5"`,
  },
  {
    method: 'GET',
    path: '/api/v1/health',
    auth: 'None',
    description: 'Health check endpoint. Returns service status, agent count, and API version.',
    response: '{ status: "ok", agents_count: number, version: string, timestamp: string }',
    curl: `curl "${BASE_URL}/api/v1/health"`,
  },
];

function MethodBadge({ method }: { method: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold border ${METHOD_COLORS[method] ?? ''}`}>
      {method}
    </span>
  );
}

function EndpointSection({ ep }: { ep: EndpointProps }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-surface">
        <MethodBadge method={ep.method} />
        <code className="text-sm font-mono font-semibold flex-1">{ep.path}</code>
        <span className="text-xs text-muted bg-background px-2 py-0.5 rounded border border-border">{ep.auth}</span>
      </div>

      <div className="px-5 py-4 space-y-5 border-t border-border">
        <p className="text-sm text-muted">{ep.description}</p>

        {ep.params && ep.params.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Query Parameters</h4>
            <div className="space-y-1.5">
              {ep.params.map((p) => (
                <div key={p.name} className="flex items-start gap-3 text-sm">
                  <code className="text-accent font-mono text-xs shrink-0 w-40">{p.name}</code>
                  <span className="text-muted/60 text-xs font-mono shrink-0 w-32">{p.type}</span>
                  <span className="text-muted text-xs">{p.description}</span>
                  {p.required && <span className="text-danger text-xs shrink-0">required</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {ep.body && ep.body.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Request Body</h4>
            <div className="space-y-1.5">
              {ep.body.map((p) => (
                <div key={p.name} className="flex items-start gap-3 text-sm">
                  <code className="text-accent font-mono text-xs shrink-0 w-40">{p.name}</code>
                  <span className="text-muted/60 text-xs font-mono shrink-0 w-32">{p.type}</span>
                  <span className="text-muted text-xs">{p.description}</span>
                  {p.required && <span className="text-danger text-xs shrink-0">required</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Response</h4>
          <code className="text-xs text-muted/80 font-mono">{ep.response}</code>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Example</h4>
          <pre className="bg-background border border-border rounded-lg p-4 text-xs font-mono text-muted overflow-x-auto">{ep.curl}</pre>
        </div>
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">API Reference</h1>
          <p className="text-muted">
            The AgentDNS REST API enables any agent or application to search, resolve, and register AI agents programmatically.
          </p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { label: 'OpenAPI Spec', href: '/api/v1/openapi.json', ext: true },
            { label: 'A2A Agent Card', href: '/.well-known/agent.json', ext: true },
            { label: 'MCP Server', href: 'https://www.npmjs.com/package/@agentdns/mcp-server', ext: true },
            { label: 'Register Agent', href: '/register', ext: false },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              target={l.ext ? '_blank' : undefined}
              rel={l.ext ? 'noopener noreferrer' : undefined}
              className="flex items-center justify-center gap-1.5 px-4 py-3 bg-surface border border-border rounded-xl text-sm text-muted hover:text-accent hover:border-accent/50 transition-colors text-center"
            >
              {l.label}
              {l.ext && (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              )}
            </Link>
          ))}
        </div>

        {/* Authentication */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Authentication</h2>
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <p className="text-sm text-muted">
              Read operations (search, resolve) are public — no authentication required. Write operations (register, update, delete) require an API key.
            </p>
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Get an API Key</p>
              <ol className="text-sm text-muted space-y-1 list-decimal list-inside">
                <li>Sign in with GitHub at <Link href="/dashboard" className="text-accent hover:text-accent-hover">/dashboard</Link></li>
                <li>Click &ldquo;Generate API Key&rdquo; and give it a name</li>
                <li>Copy your key — it starts with <code className="font-mono text-xs bg-background px-1 py-0.5 rounded">adns_k1_</code></li>
              </ol>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Using the Key</p>
              <pre className="bg-background border border-border rounded-lg p-3 text-xs font-mono text-muted overflow-x-auto">
                {`Authorization: Bearer adns_k1_YOUR_KEY`}
              </pre>
            </div>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Rate Limits</h2>
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Tier</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Read (GET)</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Write (POST/PATCH/DELETE)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-5 py-3 text-muted">Anonymous</td>
                  <td className="px-5 py-3">60 req/min</td>
                  <td className="px-5 py-3 text-muted">—</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 text-muted">Authenticated (API key)</td>
                  <td className="px-5 py-3">200 req/min</td>
                  <td className="px-5 py-3">30 req/min</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2">Rate limit headers: <code className="font-mono">X-RateLimit-Remaining</code>, <code className="font-mono">X-RateLimit-Reset</code></p>
        </section>

        {/* Base URL */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Base URL</h2>
          <pre className="bg-surface border border-border rounded-xl p-4 text-sm font-mono">{BASE_URL}/api/v1</pre>
        </section>

        {/* Try It */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Try It</h2>
          <div className="bg-surface border border-border rounded-xl p-6">
            <p className="text-sm text-muted mb-4">Search agents live:</p>
            <form action="/explore" method="GET" className="flex gap-3">
              <input
                type="text"
                name="q"
                placeholder="browser-automation, summarization, ..."
                className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
              >
                Search
              </button>
            </form>
            <p className="text-xs text-muted mt-3">
              Or call the API directly:{' '}
              <code className="font-mono text-xs bg-background px-1.5 py-0.5 rounded border border-border">
                curl &quot;{BASE_URL}/api/v1/agents?capability=browser-automation&protocol=mcp&quot;
              </code>
            </p>
          </div>
        </section>

        {/* Endpoints */}
        <section>
          <h2 className="text-xl font-bold mb-6">Endpoints</h2>
          {ENDPOINTS.map((ep) => (
            <EndpointSection key={`${ep.method}-${ep.path}`} ep={ep} />
          ))}
        </section>

        {/* Error Codes */}
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">Error Codes</h2>
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">HTTP</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Code</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ['400', 'validation_error', 'Request body or params failed validation'],
                  ['401', 'unauthorized', 'Missing or invalid API key'],
                  ['403', 'forbidden', 'API key lacks required scope'],
                  ['404', 'not_found', 'Agent not found'],
                  ['409', 'conflict', 'Slug already exists'],
                  ['429', 'rate_limited', 'Too many requests — back off and retry'],
                  ['500', 'db_error', 'Internal server error'],
                ].map(([http, code, desc]) => (
                  <tr key={code}>
                    <td className="px-5 py-3 font-mono text-xs">{http}</td>
                    <td className="px-5 py-3 font-mono text-xs text-accent">{code}</td>
                    <td className="px-5 py-3 text-muted text-xs">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
