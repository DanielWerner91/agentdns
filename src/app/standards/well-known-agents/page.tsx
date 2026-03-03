import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ValidatorForm } from './ValidatorForm';

export const metadata: Metadata = {
  title: '.well-known/agents.json Standard — AgentDNS',
  description: 'A proposed standard for websites to declare their AI agents. Make your agents discoverable via .well-known/agents.json.',
};

const SCHEMA_EXAMPLE = `{
  "schema_version": "0.1.0",
  "site": "https://your-site.com",
  "agents": [
    {
      "name": "My Support Agent",
      "slug": "my-support-agent",
      "description": "Handles customer support inquiries",
      "capabilities": ["customer-support", "faq", "ticket-routing"],
      "protocols": ["a2a", "rest"],
      "endpoints": {
        "a2a": "https://your-site.com/.well-known/agent.json",
        "rest": "https://api.your-site.com/support"
      },
      "authentication": {
        "read": "none",
        "write": "bearer"
      }
    }
  ]
}`;

const REGISTER_EXAMPLE = `curl -X POST "https://agent-dns.tech/api/v1/agents" \\
  -H "Authorization: Bearer adns_k1_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "slug": "my-support-agent",
    "name": "My Support Agent",
    "capabilities": ["customer-support", "faq"],
    "protocols": ["a2a", "rest"],
    "a2a_endpoint": "https://your-site.com/.well-known/agent.json",
    "api_endpoint": "https://api.your-site.com/support"
  }'`;

export default function WellKnownAgentsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            Draft Standard · v0.1.0
          </div>
          <h1 className="text-3xl font-bold mb-3">The .well-known/agents.json Standard</h1>
          <p className="text-muted text-lg">
            A simple convention for websites to declare their AI agents — analogous to <code className="text-sm font-mono bg-surface px-1.5 py-0.5 rounded">robots.txt</code> for bots or <code className="text-sm font-mono bg-surface px-1.5 py-0.5 rounded">sitemap.xml</code> for pages.
          </p>
        </div>

        {/* What is it? */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">What is it?</h2>
          <div className="prose prose-sm prose-invert max-w-none text-muted space-y-3">
            <p>
              As AI agents proliferate, there is no standard way for a website to say &ldquo;here are the agents that represent us.&rdquo; The <code className="text-xs font-mono bg-surface px-1 py-0.5 rounded">.well-known/agents.json</code> standard proposes to fix this.
            </p>
            <p>
              Place a <code className="text-xs font-mono bg-surface px-1 py-0.5 rounded">agents.json</code> file at the <code className="text-xs font-mono bg-surface px-1 py-0.5 rounded">/.well-known/</code> path on your domain. Any agent, crawler, or directory (like AgentDNS) can discover your agents automatically by fetching this URL.
            </p>
            <p>
              AgentDNS uses this standard to index agents. Crawlers that respect this standard will find your agents without you having to submit them to every directory manually.
            </p>
          </div>
        </section>

        {/* JSON Schema */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Schema</h2>
          <pre className="bg-surface border border-border rounded-xl p-5 text-xs font-mono text-muted overflow-x-auto leading-relaxed">
            {SCHEMA_EXAMPLE}
          </pre>

          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-semibold">Fields</h3>
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Field</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {[
                    ['schema_version', 'string', 'Version of this spec (currently "0.1.0")'],
                    ['site', 'URL', 'Canonical URL of the declaring site'],
                    ['agents[].name', 'string', 'Human-readable agent name'],
                    ['agents[].slug', 'string', 'URL-safe identifier for the agent'],
                    ['agents[].description', 'string', 'What the agent does'],
                    ['agents[].capabilities', 'string[]', 'Capability tags (e.g. customer-support, code-generation)'],
                    ['agents[].protocols', 'string[]', 'Supported protocols: a2a, mcp, rest, graphql, websocket'],
                    ['agents[].endpoints', 'object', 'Protocol-keyed endpoint URLs'],
                    ['agents[].authentication', 'object', 'Auth requirements for read/write access'],
                  ].map(([f, t, d]) => (
                    <tr key={f}>
                      <td className="px-4 py-2.5 font-mono text-accent">{f}</td>
                      <td className="px-4 py-2.5 text-muted/60 font-mono">{t}</td>
                      <td className="px-4 py-2.5 text-muted">{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* How to add your site */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">How to Add Your Site</h2>
          <ol className="space-y-6">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/10 text-accent text-sm font-bold flex items-center justify-center">1</span>
              <div>
                <p className="font-medium mb-1">Create the file</p>
                <p className="text-sm text-muted">Place <code className="font-mono text-xs bg-surface px-1.5 py-0.5 rounded border border-border">agents.json</code> at <code className="font-mono text-xs bg-surface px-1.5 py-0.5 rounded border border-border">https://yourdomain.com/.well-known/agents.json</code></p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/10 text-accent text-sm font-bold flex items-center justify-center">2</span>
              <div>
                <p className="font-medium mb-1">Register on AgentDNS</p>
                <p className="text-sm text-muted mb-3">Submit your agents to the AgentDNS registry via API or dashboard:</p>
                <pre className="bg-surface border border-border rounded-lg p-4 text-xs font-mono text-muted overflow-x-auto">{REGISTER_EXAMPLE}</pre>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/10 text-accent text-sm font-bold flex items-center justify-center">3</span>
              <div>
                <p className="font-medium mb-1">Validate your file</p>
                <p className="text-sm text-muted">Use the validator below to check your agents.json is well-formed.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Validator */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Validator</h2>
          <div className="bg-surface border border-border rounded-xl p-6">
            <p className="text-sm text-muted mb-4">Enter your domain to validate your <code className="font-mono text-xs">/.well-known/agents.json</code> file:</p>
            <ValidatorForm />
          </div>
        </section>

        {/* AgentDNS's own file */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Eating Our Own Dog Food</h2>
          <p className="text-sm text-muted mb-4">
            AgentDNS publishes its own <code className="font-mono text-xs bg-surface px-1.5 py-0.5 rounded border border-border">agents.json</code> at the standard location:
          </p>
          <Link
            href="/.well-known/agents.json"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-accent hover:border-accent/50 transition-colors font-mono"
          >
            agent-dns.tech/.well-known/agents.json
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </Link>
        </section>

        {/* CTA */}
        <div className="bg-surface border border-border rounded-xl p-6 text-center">
          <h3 className="text-lg font-bold mb-2">Register Your Agent Today</h3>
          <p className="text-muted text-sm mb-4">Make your agents discoverable by the entire ecosystem.</p>
          <Link
            href="/register"
            className="inline-block bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            Get Started
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
