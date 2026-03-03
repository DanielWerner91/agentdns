import type { BlogPost } from '@/lib/types';

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-make-your-ai-agent-discoverable',
    title: 'How to Make Your AI Agent Discoverable: A Developer\'s Guide',
    description: 'A complete guide to registering your AI agent with AgentDNS and making it findable by other agents, applications, and users across the ecosystem.',
    date: '2025-03-03',
    readingTime: '8 min read',
    content: `
<h2>Why Agent Discovery Matters</h2>

<p>The AI agent ecosystem is exploding. MCP servers, A2A agents, REST-based bots, and autonomous systems are being built every day — but most of them exist in isolation. A developer builds an agent that can summarize legal documents, deploys it, and... nobody finds it. Not because it isn't useful. Because there's no standard way to find it.</p>

<p>This is exactly the problem DNS solved for the early web. Before DNS, if you wanted to connect to a server, you needed to know its IP address. DNS created a layer of indirection — a global registry that maps human-readable names to machine-readable addresses. <strong>AgentDNS does the same thing for AI agents.</strong></p>

<p>When your agent is registered on AgentDNS, any other agent can resolve it by capability in milliseconds:</p>

<pre><code>curl "https://agent-dns.tech/api/v1/resolve?capability=legal-summarization&protocol=mcp"</code></pre>

<p>This returns the most trusted agents matching that capability, complete with endpoints, trust scores, and communication preferences. Your agent goes from invisible to discoverable — by other agents, developers, and users searching the directory.</p>

<h2>Step 1: Get an API Key</h2>

<p>Registration requires a write-scoped API key. Here's how to get one:</p>

<ol>
  <li>Go to <a href="/register">agent-dns.tech/register</a> and sign in with GitHub</li>
  <li>Visit your <a href="/dashboard">dashboard</a> and click &ldquo;Generate API Key&rdquo;</li>
  <li>Give it a descriptive name (e.g., &ldquo;My Agent CI&rdquo;)</li>
  <li>Select the &ldquo;Write&rdquo; scope</li>
  <li>Copy the key — it starts with <code>adns_k1_</code></li>
</ol>

<p>Store it as an environment variable: <code>AGENTDNS_API_KEY=adns_k1_...</code></p>

<h2>Step 2: Register Your Agent</h2>

<p>Send a POST to <code>/api/v1/agents</code> with your agent's details. Here's a minimal registration:</p>

<pre><code>curl -X POST "https://agent-dns.tech/api/v1/agents" \\
  -H "Authorization: Bearer $AGENTDNS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "slug": "my-doc-analyzer",
    "name": "My Document Analyzer",
    "tagline": "Analyzes legal and financial documents via MCP",
    "capabilities": ["document-analysis", "summarization", "legal"],
    "protocols": ["mcp"],
    "mcp_server_url": "https://my-agent.example.com/mcp",
    "docs_url": "https://docs.my-agent.example.com",
    "pricing_model": "free"
  }'</code></pre>

<p>The response includes your agent's <code>id</code>, <code>slug</code>, and a link to its profile page at <code>/agent/my-doc-analyzer</code>.</p>

<h2>Step 3: Understand the Schema</h2>

<p>A complete agent registration can include:</p>

<ul>
  <li><strong>slug</strong> (required): Your agent's unique identifier. URL-safe, lowercase, hyphens. This becomes <code>agent-dns.tech/agent/your-slug</code>.</li>
  <li><strong>name</strong> (required): Human-readable name.</li>
  <li><strong>tagline</strong>: One-line description. This is what shows in search results.</li>
  <li><strong>description</strong>: Full markdown description. Explain what your agent does, use cases, limitations.</li>
  <li><strong>capabilities</strong>: Array of capability tags. This is the most important field for discovery.</li>
  <li><strong>protocols</strong>: <code>mcp</code>, <code>a2a</code>, <code>rest</code>, <code>graphql</code>, <code>websocket</code></li>
  <li><strong>mcp_server_url</strong>: Where to connect via MCP</li>
  <li><strong>a2a_endpoint</strong>: Your A2A agent card URL (usually <code>/.well-known/agent.json</code>)</li>
  <li><strong>api_endpoint</strong>: REST API base URL</li>
  <li><strong>docs_url</strong>: Your documentation</li>
  <li><strong>pricing_model</strong>: <code>free</code>, <code>per-task</code>, <code>subscription</code>, <code>usage-based</code>, <code>custom</code></li>
</ul>

<h2>Step 4: Choose Capability Tags Wisely</h2>

<p>Capabilities are the core of how agents find each other. When another agent calls <code>/resolve?capability=legal-summarization</code>, it gets back every agent tagged with that capability, ranked by trust score.</p>

<p><strong>Best practices for capability tagging:</strong></p>

<ul>
  <li><strong>Be specific</strong>: <code>contract-review</code> is better than <code>legal</code>. Specific tags reduce false positives.</li>
  <li><strong>Layer from general to specific</strong>: Use both <code>summarization</code> AND <code>legal-document-summarization</code>. This catches both broad and precise searches.</li>
  <li><strong>Use hyphens, lowercase only</strong>: <code>code-generation</code> not <code>Code Generation</code></li>
  <li><strong>Look at existing agents</strong>: Browse <a href="/explore">the directory</a> to see which capability tags similar agents use. Consistency helps discovery.</li>
  <li><strong>Include the action verb</strong>: <code>pdf-extraction</code> is clearer than just <code>pdf</code></li>
  <li><strong>Don't keyword-stuff</strong>: Agents with 50 generic capabilities score lower on relevance than those with 5 precise ones</li>
</ul>

<p>Common capability patterns to follow:</p>
<pre><code># Domain: what domain does your agent operate in?
"legal", "finance", "engineering", "healthcare", "content"

# Action: what does it do?
"summarization", "analysis", "generation", "translation", "extraction"

# Interface: how does it connect?
"browser-automation", "database", "api-integration"

# Output format: what does it produce?
"json-output", "markdown-generation", "pdf-export"</code></pre>

<h2>Step 5: Keep Your Registration Current</h2>

<p>Agent discovery only works if the registry is accurate. Update your registration whenever your agent's capabilities or endpoints change:</p>

<pre><code>curl -X PATCH "https://agent-dns.tech/api/v1/agents/my-doc-analyzer" \\
  -H "Authorization: Bearer $AGENTDNS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "tagline": "Now supports 40+ document formats",
    "capabilities": ["document-analysis", "summarization", "legal", "pdf-extraction", "ocr"]
  }'</code></pre>

<p>Consider adding AgentDNS registration to your CI/CD pipeline. When you deploy a new version, automatically update your registration. See our <a href="/integrations/github-action">GitHub Action integration guide</a> for a ready-to-use workflow.</p>

<h2>Step 6: Add A2A Discovery</h2>

<p>For full agent-to-agent interoperability, publish a <code>/.well-known/agent.json</code> file on your domain. This is the A2A Agent Card — a structured description of your agent that any A2A-compatible system can discover automatically.</p>

<pre><code>{
  "name": "My Document Analyzer",
  "description": "Analyzes legal and financial documents",
  "url": "https://my-agent.example.com",
  "version": "1.2.0",
  "capabilities": {
    "streaming": false,
    "pushNotifications": false
  },
  "authentication": {
    "schemes": ["bearer"],
    "credentials": "API key from https://my-agent.example.com/keys"
  },
  "skills": [
    {
      "id": "analyze_document",
      "name": "Analyze Document",
      "description": "Analyzes a document and returns structured findings",
      "tags": ["legal", "document-analysis", "summarization"]
    }
  ]
}</code></pre>

<p>Then register your A2A endpoint with AgentDNS:</p>

<pre><code>curl -X PATCH "https://agent-dns.tech/api/v1/agents/my-doc-analyzer" \\
  -H "Authorization: Bearer $AGENTDNS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "a2a_endpoint": "https://my-agent.example.com/.well-known/agent.json",
    "protocols": ["mcp", "a2a"]
  }'</code></pre>

<h2>Step 7: Use the MCP Server</h2>

<p>Want to let agents discover AgentDNS itself? Use the official MCP server:</p>

<pre><code>npx @agentdns/mcp-server</code></pre>

<p>Add this to your Claude Desktop config or any MCP client:</p>

<pre><code>{
  "mcpServers": {
    "agentdns": {
      "command": "npx",
      "args": ["@agentdns/mcp-server"],
      "env": {
        "AGENTDNS_API_KEY": "adns_k1_YOUR_KEY"
      }
    }
  }
}</code></pre>

<p>Now any agent running in that context can call <code>search_agents</code>, <code>resolve_by_capability</code>, <code>register_agent</code>, and more — all via natural language tool calls.</p>

<h2>Checklist: Making Your Agent Discoverable</h2>

<ul>
  <li>✅ Registered on <a href="/explore">AgentDNS</a> with accurate capabilities</li>
  <li>✅ Capability tags are specific and consistent with the ecosystem</li>
  <li>✅ Tagline is clear and action-oriented</li>
  <li>✅ At least one endpoint URL (MCP, A2A, or REST)</li>
  <li>✅ Pricing model set correctly</li>
  <li>✅ <code>/.well-known/agent.json</code> published on your domain</li>
  <li>✅ Registration updates automated via CI/CD or GitHub Action</li>
  <li>✅ <code>/.well-known/agents.json</code> on your domain (emerging standard)</li>
</ul>

<h2>What Happens Next</h2>

<p>Once registered, your agent appears in:</p>
<ul>
  <li><strong>The public directory</strong> at <a href="/explore">agent-dns.tech/explore</a></li>
  <li><strong>API search results</strong> for matching capability queries</li>
  <li><strong>The MCP server</strong> when other Claude instances search for agents</li>
  <li><strong>The OpenAPI spec</strong> at <code>/api/v1/openapi.json</code> for automated tooling</li>
  <li><strong>The A2A agent card</strong> at <code>/.well-known/agent.json</code></li>
</ul>

<p>Every time your agent is queried via AgentDNS, its lookup count increases — building the trust score that helps it rank higher in results over time.</p>

<p>Start now: <a href="/register">register your agent in under 5 minutes</a>.</p>
`,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
