import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'GitHub Action — AgentDNS',
  description: 'Automatically register and update your agent on AgentDNS when you push to GitHub.',
};

const WORKFLOW_YAML = `name: Register on AgentDNS

on:
  push:
    branches: [main]
    paths:
      - 'agentdns.json'
      - '.github/workflows/agentdns-register.yml'

jobs:
  register:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Register / Update Agent on AgentDNS
        env:
          AGENTDNS_API_KEY: \${{ secrets.AGENTDNS_API_KEY }}
        run: |
          SLUG=$(jq -r '.slug' agentdns.json)
          PAYLOAD=$(cat agentdns.json)

          # Try to update first, fall back to create
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" \\
            -X PATCH "https://agent-dns.tech/api/v1/agents/$SLUG" \\
            -H "Authorization: Bearer $AGENTDNS_API_KEY" \\
            -H "Content-Type: application/json" \\
            -d "$PAYLOAD")

          if [ "$STATUS" = "404" ]; then
            echo "Agent not found, creating..."
            curl -f -X POST "https://agent-dns.tech/api/v1/agents" \\
              -H "Authorization: Bearer $AGENTDNS_API_KEY" \\
              -H "Content-Type: application/json" \\
              -d "$PAYLOAD"
          else
            echo "Agent updated (HTTP $STATUS)"
          fi`;

const AGENTDNS_JSON = `{
  "slug": "my-agent",
  "name": "My Agent",
  "tagline": "Does amazing things with AI",
  "description": "Full description of what my agent does.",
  "capabilities": ["summarization", "translation", "analysis"],
  "protocols": ["mcp", "rest"],
  "mcp_server_url": "https://my-agent.example.com/mcp",
  "api_endpoint": "https://api.my-agent.example.com/v1",
  "docs_url": "https://docs.my-agent.example.com",
  "pricing_model": "free"
}`;

export default function GitHubActionPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-foreground">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <h1 className="text-3xl font-bold">GitHub Action</h1>
          </div>
          <p className="text-muted">
            Automatically register and update your agent on AgentDNS whenever you push to your main branch. One file in your repo, one secret in GitHub — done.
          </p>
        </div>

        {/* How it works */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">How it works</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Add agentdns.json', desc: 'Create an agentdns.json in your repo root with your agent\'s details' },
              { step: '2', title: 'Add secret', desc: 'Add AGENTDNS_API_KEY to your repository secrets' },
              { step: '3', title: 'Auto-sync', desc: 'Every push to main updates your agent in the registry automatically' },
            ].map((s) => (
              <div key={s.step} className="bg-surface border border-border rounded-xl p-4 text-center">
                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent text-sm font-bold flex items-center justify-center mx-auto mb-3">{s.step}</div>
                <p className="text-sm font-semibold mb-1">{s.title}</p>
                <p className="text-xs text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Setup */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-6">Setup</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-base font-semibold mb-1">Step 1: Create agentdns.json</h3>
              <p className="text-sm text-muted mb-3">Add this file to the root of your repository:</p>
              <pre className="bg-surface border border-border rounded-xl p-5 text-xs font-mono text-muted overflow-x-auto leading-relaxed">{AGENTDNS_JSON}</pre>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-1">Step 2: Get an API Key</h3>
              <ol className="text-sm text-muted space-y-1.5 list-decimal list-inside">
                <li>Sign in at <Link href="/dashboard" className="text-accent hover:text-accent-hover">/dashboard</Link></li>
                <li>Generate an API key with write scope</li>
                <li>In your GitHub repo: Settings → Secrets → Actions → New secret</li>
                <li>Name: <code className="font-mono text-xs bg-surface px-1.5 py-0.5 rounded border border-border">AGENTDNS_API_KEY</code>, Value: your key</li>
              </ol>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-1">Step 3: Add the workflow</h3>
              <p className="text-sm text-muted mb-3">Create <code className="font-mono text-xs bg-surface px-1.5 py-0.5 rounded border border-border">.github/workflows/agentdns-register.yml</code>:</p>
              <pre className="bg-surface border border-border rounded-xl p-5 text-xs font-mono text-muted overflow-x-auto leading-relaxed">{WORKFLOW_YAML}</pre>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-1">Step 4: Push to main</h3>
              <p className="text-sm text-muted">Commit and push. The action will run automatically. Check the Actions tab in GitHub to see the result.</p>
            </div>
          </div>
        </section>

        {/* How it works under the hood */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Under the Hood</h2>
          <div className="bg-surface border border-border rounded-xl p-5 text-sm text-muted space-y-2">
            <p>The workflow reads your <code className="font-mono text-xs bg-background px-1 py-0.5 rounded">agentdns.json</code> and calls the AgentDNS REST API:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>First tries <code className="font-mono text-xs">PATCH /api/v1/agents/{'{slug}'}</code> to update an existing registration</li>
              <li>If the agent doesn&apos;t exist (404), falls back to <code className="font-mono text-xs">POST /api/v1/agents</code> to create it</li>
              <li>Uses your <code className="font-mono text-xs">AGENTDNS_API_KEY</code> for authentication</li>
              <li>Runs only when <code className="font-mono text-xs">agentdns.json</code> changes, minimizing unnecessary API calls</li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-surface border border-border rounded-xl p-6 flex items-center justify-between gap-6">
          <div>
            <p className="font-semibold mb-1">Ready to automate?</p>
            <p className="text-sm text-muted">Generate your API key in the dashboard and add the workflow to your repo.</p>
          </div>
          <Link
            href="/dashboard"
            className="shrink-0 bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            Get API Key
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
