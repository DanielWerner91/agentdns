/**
 * AgentDNS Community Seed Script
 * Registers 52+ well-known MCP servers and AI agents as community-listed entries.
 *
 * Usage:
 *   npx tsx scripts/seed-agents.ts
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 * Run migration 003_add_listing_type.sql in Supabase first for full listing_type support.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local
try {
  const envFile = readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  console.warn('Could not read .env.local — using existing env vars');
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

interface AgentSeed {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  capabilities: string[];
  categories: string[];
  protocols: string[];
  docs_url: string;
  owner_id: string;
  owner_name: string;
  pricing_model: string;
  metadata: Record<string, unknown>;
}

const AGENTS: AgentSeed[] = [
  // ─── Developer Tools ──────────────────────────────────────────
  {
    slug: 'playwright-mcp',
    name: 'Playwright MCP Server',
    tagline: 'Browser automation for testing and scraping via MCP',
    description: 'Playwright MCP Server enables LLM agents to control browsers for end-to-end testing, web scraping, and automated UI interactions. Supports Chromium, Firefox, and WebKit.',
    capabilities: ['browser-automation', 'testing', 'web-scraping', 'ui-automation'],
    categories: ['developer-tools'],
    protocols: ['mcp'],
    docs_url: 'https://github.com/executeautomation/playwright-mcp-server',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://github.com/executeautomation/playwright-mcp-server' },
  },
  {
    slug: 'github-mcp',
    name: 'GitHub MCP Server',
    tagline: 'Manage repos, issues, PRs, and code search via MCP',
    description: 'Official GitHub MCP Server for managing repositories, issues, pull requests, code search, and GitHub Actions. Part of the Model Context Protocol reference implementation.',
    capabilities: ['code-management', 'version-control', 'github', 'code-search', 'pull-requests'],
    categories: ['developer-tools'],
    protocols: ['mcp'],
    docs_url: 'https://github.com/modelcontextprotocol/servers',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://github.com/modelcontextprotocol/servers' },
  },
  {
    slug: 'supabase-mcp',
    name: 'Supabase MCP Server',
    tagline: 'Database, auth, and edge functions management via MCP',
    description: 'Official Supabase MCP Server for managing Postgres databases, authentication, storage, and edge functions. Query data, manage schema, and interact with all Supabase services.',
    capabilities: ['database', 'authentication', 'postgres', 'edge-functions', 'storage'],
    categories: ['developer-tools', 'data-analytics'],
    protocols: ['mcp'],
    docs_url: 'https://supabase.com/docs/guides/ai/mcp',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://supabase.com/docs/guides/ai/mcp' },
  },
  {
    slug: 'context7',
    name: 'Context7',
    tagline: 'Up-to-date library and framework documentation for LLMs',
    description: 'Context7 provides LLMs with current, version-specific documentation for thousands of programming libraries and frameworks. Eliminates hallucinated APIs by grounding responses in real docs.',
    capabilities: ['documentation', 'code-reference', 'developer-tools', 'library-docs'],
    categories: ['developer-tools'],
    protocols: ['mcp'],
    docs_url: 'https://context7.com',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://context7.com' },
  },
  {
    slug: 'gitmcp',
    name: 'GitMCP',
    tagline: 'Open-source remote MCP server for any GitHub project',
    description: 'GitMCP turns any GitHub repository into an MCP server, giving AI agents access to the full codebase, documentation, and README. No local setup required.',
    capabilities: ['code-reference', 'documentation', 'github', 'repository-access'],
    categories: ['developer-tools'],
    protocols: ['mcp'],
    docs_url: 'https://gitmcp.io',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://gitmcp.io' },
  },
  {
    slug: 'devin-ai',
    name: 'Devin AI',
    tagline: 'Autonomous AI software engineer',
    description: 'Devin is an autonomous AI software engineer that can plan and execute complex engineering tasks, write code, debug, and deploy applications end-to-end.',
    capabilities: ['coding', 'software-development', 'debugging', 'deployment', 'autonomous-agent'],
    categories: ['developer-tools'],
    protocols: ['rest'],
    docs_url: 'https://devin.ai',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'subscription',
    metadata: { listing_type: 'community', source_url: 'https://devin.ai' },
  },
  {
    slug: 'dbt-mcp',
    name: 'dbt MCP Server',
    tagline: 'Data build tool integration for analytics pipelines via MCP',
    description: 'Official dbt MCP Server for interacting with dbt Cloud and dbt Core. Run models, test pipelines, explore lineage, and manage data transformations via natural language.',
    capabilities: ['data-engineering', 'sql', 'analytics', 'data-transformation', 'pipeline'],
    categories: ['developer-tools', 'data-analytics'],
    protocols: ['mcp'],
    docs_url: 'https://github.com/dbt-labs/dbt-mcp',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://github.com/dbt-labs/dbt-mcp' },
  },

  // ─── Data & Analytics ─────────────────────────────────────────
  {
    slug: 'postgres-mcp',
    name: 'Postgres MCP Server',
    tagline: 'Read-only SQL queries against PostgreSQL databases via MCP',
    description: 'Reference implementation MCP server for PostgreSQL databases. Execute read-only SQL queries, explore schema, and analyze data with natural language.',
    capabilities: ['database', 'sql', 'analytics', 'postgres', 'schema-exploration'],
    categories: ['data-analytics'],
    protocols: ['mcp'],
    docs_url: 'https://github.com/modelcontextprotocol/servers',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://github.com/modelcontextprotocol/servers' },
  },
  {
    slug: 'mongodb-mcp',
    name: 'MongoDB MCP Server',
    tagline: 'Bridge between MongoDB Atlas and conversational AI interfaces',
    description: 'Official MongoDB MCP Server for querying and managing MongoDB Atlas databases. Execute aggregation pipelines, manage collections, and explore document schemas via natural language.',
    capabilities: ['database', 'nosql', 'data-management', 'mongodb', 'aggregation'],
    categories: ['data-analytics'],
    protocols: ['mcp'],
    docs_url: 'https://github.com/mongodb/mongodb-mcp-server',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://github.com/mongodb/mongodb-mcp-server' },
  },
  {
    slug: 'duckdb-motherduck',
    name: 'DuckDB / MotherDuck MCP',
    tagline: 'Flexible querying and analysis of structured data via MCP',
    description: 'MCP server for DuckDB and MotherDuck cloud. Run analytical SQL queries on local files (Parquet, CSV, JSON) or cloud data warehouses with blazing-fast in-process execution.',
    capabilities: ['analytics', 'sql', 'data-science', 'parquet', 'olap'],
    categories: ['data-analytics'],
    protocols: ['mcp'],
    docs_url: 'https://motherduck.com',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://motherduck.com' },
  },
  {
    slug: 'pinecone-mcp',
    name: 'Pinecone MCP Server',
    tagline: 'Vector similarity search and RAG retrieval via MCP',
    description: 'Official Pinecone MCP Server for vector database operations. Index documents, query by semantic similarity, and build RAG pipelines with Pinecone\'s managed vector store.',
    capabilities: ['vector-search', 'rag', 'semantic-retrieval', 'embeddings', 'similarity-search'],
    categories: ['data-analytics'],
    protocols: ['mcp'],
    docs_url: 'https://pinecone.io',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'usage-based',
    metadata: { listing_type: 'community', source_url: 'https://pinecone.io' },
  },

  // ─── Productivity & Workflow ───────────────────────────────────
  {
    slug: 'notion-mcp',
    name: 'Notion MCP Server',
    tagline: 'Search, query databases, and manage pages in Notion',
    description: 'Official Notion MCP Server for reading and writing Notion pages, databases, and blocks. Search knowledge bases, update documents, and query structured databases via natural language.',
    capabilities: ['productivity', 'knowledge-management', 'note-taking', 'databases', 'documentation'],
    categories: ['productivity'],
    protocols: ['mcp'],
    docs_url: 'https://github.com/makenotion/notion-mcp-server',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://github.com/makenotion/notion-mcp-server' },
  },
  {
    slug: 'slack-mcp',
    name: 'Slack MCP Server',
    tagline: 'Real-time conversation access and messaging via MCP',
    description: 'Reference implementation MCP server for Slack. Read channels, send messages, search conversations, and interact with the Slack API for team communication workflows.',
    capabilities: ['communication', 'team-collaboration', 'messaging', 'search'],
    categories: ['productivity'],
    protocols: ['mcp'],
    docs_url: 'https://github.com/modelcontextprotocol/servers',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://github.com/modelcontextprotocol/servers' },
  },
  {
    slug: 'google-calendar-mcp',
    name: 'Google Calendar MCP',
    tagline: 'Calendar management and scheduling via MCP',
    description: 'MCP server for Google Calendar API. Create and manage events, check availability, schedule meetings, and get calendar overview through natural language.',
    capabilities: ['scheduling', 'calendar', 'productivity', 'events', 'time-management'],
    categories: ['productivity'],
    protocols: ['mcp'],
    docs_url: 'https://developers.google.com',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://developers.google.com' },
  },
  {
    slug: 'gmail-mcp',
    name: 'Gmail MCP Server',
    tagline: 'Email management and automation via MCP',
    description: 'MCP server for Gmail API. Read, search, compose, and send emails. Manage labels, threads, and attachments through natural language commands.',
    capabilities: ['email', 'communication', 'productivity', 'search', 'automation'],
    categories: ['productivity'],
    protocols: ['mcp'],
    docs_url: 'https://developers.google.com',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://developers.google.com' },
  },
  {
    slug: 'zapier-mcp',
    name: 'Zapier MCP Server',
    tagline: 'Connect to 8,000+ apps via Zapier workflows',
    description: 'Zapier MCP Server gives AI agents access to 8,000+ app integrations via Zapier. Trigger automations, run Zaps, and connect any tool in your stack.',
    capabilities: ['automation', 'integration', 'workflow', 'no-code', 'app-connectivity'],
    categories: ['productivity'],
    protocols: ['mcp'],
    docs_url: 'https://zapier.com',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'subscription',
    metadata: { listing_type: 'community', source_url: 'https://zapier.com' },
  },
  {
    slug: 'n8n-mcp',
    name: 'n8n MCP Server',
    tagline: 'Workflow automation with 525+ node integrations via MCP',
    description: 'n8n MCP Server enables AI agents to trigger and manage n8n workflows. Access 525+ integrations, execute automations, and orchestrate complex multi-step processes.',
    capabilities: ['automation', 'workflow', 'integration', 'no-code', 'orchestration'],
    categories: ['productivity'],
    protocols: ['mcp'],
    docs_url: 'https://n8n.io',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://n8n.io' },
  },

  // ─── Cloud & Infrastructure ────────────────────────────────────
  {
    slug: 'cloudflare-mcp',
    name: 'Cloudflare MCP Server',
    tagline: 'Deploy and manage Workers, KV, R2, and D1 via MCP',
    description: 'Official Cloudflare MCP Server for managing the full Cloudflare developer platform. Deploy Workers, manage KV stores, R2 buckets, D1 databases, and configure DNS.',
    capabilities: ['cloud-deployment', 'serverless', 'infrastructure', 'cdn', 'edge-computing'],
    categories: ['infrastructure'],
    protocols: ['mcp'],
    docs_url: 'https://developers.cloudflare.com',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://developers.cloudflare.com' },
  },
  {
    slug: 'aws-docs-mcp',
    name: 'AWS Documentation MCP',
    tagline: 'Access and search AWS documentation via MCP',
    description: 'Official AWS Labs MCP Server for searching and retrieving AWS documentation. Get accurate, up-to-date information about AWS services, APIs, and best practices.',
    capabilities: ['cloud', 'documentation', 'aws', 'search', 'reference'],
    categories: ['infrastructure'],
    protocols: ['mcp'],
    docs_url: 'https://github.com/awslabs/mcp',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://github.com/awslabs/mcp' },
  },
  {
    slug: 'salesforce-mcp',
    name: 'Salesforce MCP Server',
    tagline: 'CRM data, metadata, and SOQL queries via MCP',
    description: 'Official Salesforce MCP Server for querying CRM data with SOQL, accessing Salesforce metadata, managing records, and interacting with Salesforce APIs.',
    capabilities: ['crm', 'sales', 'enterprise', 'soql', 'data-management'],
    categories: ['infrastructure'],
    protocols: ['mcp'],
    docs_url: 'https://github.com/salesforce/salesforce-mcp',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://github.com/salesforce/salesforce-mcp' },
  },

  // ─── Content & Media ──────────────────────────────────────────
  {
    slug: 'minimax-mcp',
    name: 'MiniMax MCP Server',
    tagline: 'Text-to-speech, image generation, and video generation via MCP',
    description: 'MiniMax MCP Server for multimodal AI generation. Create realistic speech synthesis, generate images, and produce video content via the MiniMax AI API.',
    capabilities: ['tts', 'image-generation', 'video-generation', 'multimodal', 'voice-synthesis'],
    categories: ['content-media'],
    protocols: ['mcp'],
    docs_url: 'https://github.com/MiniMax-AI',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'usage-based',
    metadata: { listing_type: 'community', source_url: 'https://github.com/MiniMax-AI' },
  },
  {
    slug: 'elevenlabs-mcp',
    name: 'ElevenLabs MCP',
    tagline: 'Voice synthesis and audio generation via MCP',
    description: 'Official ElevenLabs MCP Server for high-quality voice synthesis. Generate realistic speech in 29+ languages, clone voices, and produce audio content with emotional control.',
    capabilities: ['voice-synthesis', 'audio', 'tts', 'voice-cloning', 'multilingual'],
    categories: ['content-media'],
    protocols: ['mcp'],
    docs_url: 'https://elevenlabs.io',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'usage-based',
    metadata: { listing_type: 'community', source_url: 'https://elevenlabs.io' },
  },
  {
    slug: 'jina-ai-mcp',
    name: 'Jina AI MCP Server',
    tagline: 'Search and content extraction via MCP',
    description: 'Jina AI MCP Server for web search, content extraction, and multimodal embeddings. Fetch URLs, search the web, and extract structured content from any page.',
    capabilities: ['web-search', 'content-extraction', 'research', 'embeddings', 'multimodal'],
    categories: ['content-media', 'web-browser'],
    protocols: ['mcp'],
    docs_url: 'https://jina.ai',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://jina.ai' },
  },

  // ─── Web & Browser ─────────────────────────────────────────────
  {
    slug: 'browserbase-mcp',
    name: 'Browserbase MCP',
    tagline: 'Cloud browser automation for navigation and data extraction',
    description: 'Browserbase MCP Server for cloud-based browser automation. Navigate websites, extract data, fill forms, and automate web interactions without managing browser infrastructure.',
    capabilities: ['browser-automation', 'web-scraping', 'cloud', 'data-extraction', 'navigation'],
    categories: ['web-browser'],
    protocols: ['mcp'],
    docs_url: 'https://browserbase.com',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'usage-based',
    metadata: { listing_type: 'community', source_url: 'https://browserbase.com' },
  },
  {
    slug: 'firecrawl-mcp',
    name: 'Firecrawl MCP',
    tagline: 'Web scraping and search for LLM clients via MCP',
    description: 'Firecrawl MCP Server for intelligent web scraping and crawling. Extract clean, structured data from any website, convert to Markdown, and handle JavaScript-rendered content.',
    capabilities: ['web-scraping', 'search', 'data-extraction', 'crawling', 'markdown-conversion'],
    categories: ['web-browser'],
    protocols: ['mcp'],
    docs_url: 'https://firecrawl.dev',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'usage-based',
    metadata: { listing_type: 'community', source_url: 'https://firecrawl.dev' },
  },
  {
    slug: 'tavily-mcp',
    name: 'Tavily MCP Server',
    tagline: 'Real-time web search and content extraction for research',
    description: 'Tavily MCP Server for real-time web search optimized for AI agents. Get accurate, up-to-date search results with source citations and extracted content.',
    capabilities: ['web-search', 'research', 'real-time-data', 'content-extraction', 'citations'],
    categories: ['web-browser'],
    protocols: ['mcp'],
    docs_url: 'https://tavily.com',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'usage-based',
    metadata: { listing_type: 'community', source_url: 'https://tavily.com' },
  },

  // ─── Finance & Commerce ────────────────────────────────────────
  {
    slug: 'stripe-mcp',
    name: 'Stripe MCP Server',
    tagline: 'Payment processing and financial operations via MCP',
    description: 'Official Stripe MCP Server for payment processing, subscription management, and financial analytics. Query payments, manage customers, and access Stripe data via natural language.',
    capabilities: ['payments', 'billing', 'commerce', 'subscriptions', 'financial-data'],
    categories: ['finance'],
    protocols: ['mcp'],
    docs_url: 'https://github.com/stripe/agent-toolkit',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://github.com/stripe/agent-toolkit' },
  },
  {
    slug: 'financial-datasets-mcp',
    name: 'Financial Datasets MCP',
    tagline: 'Stock market data, earnings, and balance sheets via MCP',
    description: 'MCP Server for Financial Datasets API. Access real-time and historical stock prices, earnings reports, balance sheets, income statements, and SEC filings.',
    capabilities: ['financial-data', 'stock-market', 'analytics', 'earnings', 'sec-filings'],
    categories: ['finance'],
    protocols: ['mcp'],
    docs_url: 'https://financialdatasets.ai',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'usage-based',
    metadata: { listing_type: 'community', source_url: 'https://financialdatasets.ai' },
  },

  // ─── Design & Creative ─────────────────────────────────────────
  {
    slug: 'figma-mcp',
    name: 'Figma MCP Server',
    tagline: 'Design file access and manipulation via MCP',
    description: 'Official Figma MCP Server for accessing and manipulating design files. Read design tokens, inspect components, extract assets, and interact with Figma designs programmatically.',
    capabilities: ['design', 'ui-ux', 'prototyping', 'design-tokens', 'asset-extraction'],
    categories: ['design-creative'],
    protocols: ['mcp'],
    docs_url: 'https://figma.com',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://figma.com' },
  },
  {
    slug: 'blender-mcp',
    name: 'Blender MCP Server',
    tagline: '3D modeling and scene creation via AI',
    description: 'Blender MCP Server connects AI agents directly to Blender for 3D modeling, scene creation, and rendering. Control objects, materials, lighting, and animations via natural language.',
    capabilities: ['3d-modeling', 'creative', 'visualization', 'rendering', 'animation'],
    categories: ['design-creative'],
    protocols: ['mcp'],
    docs_url: 'https://github.com/ahujasid/blender-mcp',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://github.com/ahujasid/blender-mcp' },
  },
  {
    slug: 'excalidraw-mcp',
    name: 'Excalidraw MCP',
    tagline: 'Hand-drawn style diagram rendering via MCP',
    description: 'Excalidraw MCP Server for creating and rendering hand-drawn style diagrams. Generate flowcharts, architecture diagrams, and whiteboards from natural language descriptions.',
    capabilities: ['diagramming', 'visualization', 'whiteboard', 'flowcharts', 'architecture-diagrams'],
    categories: ['design-creative'],
    protocols: ['mcp'],
    docs_url: 'https://github.com/excalidraw/excalidraw-mcp',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://github.com/excalidraw/excalidraw-mcp' },
  },

  // ─── Maps & Location ───────────────────────────────────────────
  {
    slug: 'google-maps-mcp',
    name: 'Google Maps MCP',
    tagline: 'Location data, geocoding, and place details via MCP',
    description: 'Google Maps MCP Server for location intelligence. Geocode addresses, search places, get directions, calculate distances, and retrieve rich location data via the Maps API.',
    capabilities: ['geolocation', 'maps', 'location-data', 'geocoding', 'place-search'],
    categories: ['maps-location'],
    protocols: ['mcp'],
    docs_url: 'https://developers.google.com/maps',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'usage-based',
    metadata: { listing_type: 'community', source_url: 'https://developers.google.com/maps' },
  },

  // ─── Specialized ───────────────────────────────────────────────
  {
    slug: 'atlassian-mcp',
    name: 'Atlassian MCP (Confluence + Jira)',
    tagline: 'Access Confluence pages and Jira issues via MCP',
    description: 'Official Atlassian MCP Server for accessing Confluence knowledge bases and Jira issue tracking. Search pages, create issues, manage sprints, and extract project data.',
    capabilities: ['project-management', 'documentation', 'issue-tracking', 'knowledge-base', 'agile'],
    categories: ['productivity'],
    protocols: ['mcp'],
    docs_url: 'https://atlassian.com',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'subscription',
    metadata: { listing_type: 'community', source_url: 'https://atlassian.com' },
  },
  {
    slug: 'langchain-mcp',
    name: 'LangChain MCP Server',
    tagline: 'Agent building and knowledge base querying via MCP',
    description: 'LangChain MCP Server for orchestrating AI agents and querying vector knowledge bases. Build complex agent pipelines, RAG applications, and multi-tool workflows.',
    capabilities: ['agent-framework', 'orchestration', 'rag', 'knowledge-base', 'chain-of-thought'],
    categories: ['specialized'],
    protocols: ['mcp'],
    docs_url: 'https://langchain.com',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://langchain.com' },
  },
  {
    slug: 'perplexity-mcp',
    name: 'Perplexity MCP Server',
    tagline: 'Web search within the MCP ecosystem',
    description: 'Perplexity MCP Server for real-time web search with citations. Get up-to-date answers to questions with source references, powered by the Perplexity search API.',
    capabilities: ['web-search', 'research', 'question-answering', 'citations', 'real-time-data'],
    categories: ['web-browser'],
    protocols: ['mcp'],
    docs_url: 'https://perplexity.ai',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'usage-based',
    metadata: { listing_type: 'community', source_url: 'https://perplexity.ai' },
  },

  // ─── Additional 17 agents to reach 52+ ────────────────────────
  {
    slug: 'sentry-mcp',
    name: 'Sentry MCP Server',
    tagline: 'Error tracking, performance monitoring, and debugging via MCP',
    description: 'Official Sentry MCP Server for error tracking and performance monitoring. Query issues, analyze stack traces, review releases, and manage alerts through natural language.',
    capabilities: ['error-tracking', 'monitoring', 'debugging', 'performance', 'alerting'],
    categories: ['developer-tools'],
    protocols: ['mcp'],
    docs_url: 'https://sentry.io',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://sentry.io' },
  },
  {
    slug: 'linear-mcp',
    name: 'Linear MCP Server',
    tagline: 'Issue tracking, sprints, and roadmaps via MCP',
    description: 'Linear MCP Server for engineering teams. Create and manage issues, track sprints, view roadmaps, and query project data directly from your AI assistant.',
    capabilities: ['project-management', 'issue-tracking', 'engineering', 'sprints', 'roadmap'],
    categories: ['developer-tools', 'productivity'],
    protocols: ['mcp'],
    docs_url: 'https://linear.app',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'subscription',
    metadata: { listing_type: 'community', source_url: 'https://linear.app' },
  },
  {
    slug: 'docker-mcp',
    name: 'Docker MCP Server',
    tagline: 'Container management, compose, and Docker Hub via MCP',
    description: 'Docker MCP Server for managing containers, images, networks, and volumes. List and inspect containers, manage Docker Compose stacks, and interact with Docker Hub.',
    capabilities: ['containerization', 'deployment', 'devops', 'docker', 'orchestration'],
    categories: ['infrastructure'],
    protocols: ['mcp'],
    docs_url: 'https://github.com/docker/mcp-servers',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://github.com/docker/mcp-servers' },
  },
  {
    slug: 'kubernetes-mcp',
    name: 'Kubernetes MCP Server',
    tagline: 'Cluster management and resource orchestration via MCP',
    description: 'Kubernetes MCP Server for managing K8s clusters. List and inspect pods, deployments, services, configmaps, and secrets. Apply manifests and manage workloads via natural language.',
    capabilities: ['orchestration', 'kubernetes', 'devops', 'cluster-management', 'deployment'],
    categories: ['infrastructure'],
    protocols: ['mcp'],
    docs_url: 'https://github.com/manusa/kubernetes-mcp-server',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://github.com/manusa/kubernetes-mcp-server' },
  },
  {
    slug: 'grafana-mcp',
    name: 'Grafana MCP Server',
    tagline: 'Observability dashboards and alerting via MCP',
    description: 'Official Grafana MCP Server for querying metrics, exploring dashboards, and managing alerts. Connect to Grafana Cloud or self-hosted instances to analyze observability data.',
    capabilities: ['observability', 'monitoring', 'dashboards', 'metrics', 'alerting'],
    categories: ['infrastructure'],
    protocols: ['mcp'],
    docs_url: 'https://grafana.com',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://grafana.com' },
  },
  {
    slug: 'airtable-mcp',
    name: 'Airtable MCP Server',
    tagline: 'Database tables, records, and views via MCP',
    description: 'Airtable MCP Server for accessing and managing Airtable bases. Query records, create entries, update fields, and interact with Airtable databases through natural language.',
    capabilities: ['database', 'spreadsheet', 'data-management', 'no-code', 'records'],
    categories: ['productivity', 'data-analytics'],
    protocols: ['mcp'],
    docs_url: 'https://airtable.com',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://airtable.com' },
  },
  {
    slug: 'todoist-mcp',
    name: 'Todoist MCP Server',
    tagline: 'Task management, projects, and labels via MCP',
    description: 'Todoist MCP Server for task and project management. Create tasks, manage projects, set priorities and due dates, and organize labels through your AI assistant.',
    capabilities: ['task-management', 'productivity', 'todo', 'projects', 'scheduling'],
    categories: ['productivity'],
    protocols: ['mcp'],
    docs_url: 'https://todoist.com',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://todoist.com' },
  },
  {
    slug: 'redis-mcp',
    name: 'Redis MCP Server',
    tagline: 'In-memory key-value store and caching operations via MCP',
    description: 'Redis MCP Server for interacting with Redis databases. Get, set, and manage keys, work with data structures, monitor performance, and execute Redis commands via natural language.',
    capabilities: ['caching', 'database', 'key-value-store', 'pub-sub', 'data-structures'],
    categories: ['data-analytics', 'infrastructure'],
    protocols: ['mcp'],
    docs_url: 'https://redis.io',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://redis.io' },
  },
  {
    slug: 'brave-search-mcp',
    name: 'Brave Search MCP',
    tagline: 'Privacy-respecting web search via MCP',
    description: 'Brave Search MCP Server for privacy-first web search. Get web, news, and image results without tracking. Powered by Brave\'s independent search index.',
    capabilities: ['web-search', 'privacy', 'research', 'news', 'independent-index'],
    categories: ['web-browser'],
    protocols: ['mcp'],
    docs_url: 'https://brave.com/search/api',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://brave.com/search/api' },
  },
  {
    slug: 'exa-mcp',
    name: 'Exa MCP Server',
    tagline: 'Neural search and content retrieval via MCP',
    description: 'Exa MCP Server for semantic web search and content retrieval. Search by meaning (not just keywords), find similar content, and retrieve full page text with Exa\'s neural search API.',
    capabilities: ['semantic-search', 'embeddings', 'research', 'content-retrieval', 'similarity-search'],
    categories: ['web-browser'],
    protocols: ['mcp'],
    docs_url: 'https://exa.ai',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'usage-based',
    metadata: { listing_type: 'community', source_url: 'https://exa.ai' },
  },
  {
    slug: 'puppeteer-mcp',
    name: 'Puppeteer MCP Server',
    tagline: 'Headless browser automation via MCP',
    description: 'Reference implementation Puppeteer MCP Server for headless Chrome automation. Navigate pages, take screenshots, interact with forms, extract content, and automate browser tasks.',
    capabilities: ['browser-automation', 'web-scraping', 'testing', 'screenshots', 'headless-browser'],
    categories: ['web-browser', 'developer-tools'],
    protocols: ['mcp'],
    docs_url: 'https://github.com/modelcontextprotocol/servers',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://github.com/modelcontextprotocol/servers' },
  },
  {
    slug: 'filesystem-mcp',
    name: 'Filesystem MCP Server',
    tagline: 'Local file system read/write operations via MCP',
    description: 'Reference implementation Filesystem MCP Server for local file operations. Read, write, create, delete files and directories. Essential for agents working with local codebases and documents.',
    capabilities: ['file-management', 'filesystem', 'developer-tools', 'read-write', 'directory'],
    categories: ['developer-tools'],
    protocols: ['mcp'],
    docs_url: 'https://github.com/modelcontextprotocol/servers',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://github.com/modelcontextprotocol/servers' },
  },
  {
    slug: 'sequential-thinking-mcp',
    name: 'Sequential Thinking MCP',
    tagline: 'Dynamic problem-solving through sequential thought chains',
    description: 'Sequential Thinking MCP Server enables structured problem-solving via step-by-step reasoning chains. Break complex problems into sequential thoughts with revision, backtracking, and hypothesis testing.',
    capabilities: ['reasoning', 'problem-solving', 'chain-of-thought', 'planning', 'structured-thinking'],
    categories: ['specialized'],
    protocols: ['mcp'],
    docs_url: 'https://github.com/modelcontextprotocol/servers',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://github.com/modelcontextprotocol/servers' },
  },
  {
    slug: 'memory-mcp',
    name: 'Memory MCP Server',
    tagline: 'Persistent cross-session memory via knowledge graphs',
    description: 'Reference implementation Memory MCP Server for persistent agent memory. Store and retrieve information across conversations using a knowledge graph. Entities, relations, and observations persist between sessions.',
    capabilities: ['memory', 'knowledge-graph', 'context-management', 'persistence', 'entities'],
    categories: ['specialized'],
    protocols: ['mcp'],
    docs_url: 'https://github.com/modelcontextprotocol/servers',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://github.com/modelcontextprotocol/servers' },
  },
  {
    slug: 'fetch-mcp',
    name: 'Fetch MCP Server',
    tagline: 'Web content fetching and Markdown conversion via MCP',
    description: 'Reference implementation Fetch MCP Server for retrieving web content. Fetch any URL and convert HTML to clean Markdown, extract specific content, and handle pagination.',
    capabilities: ['web-fetch', 'content-extraction', 'markdown-conversion', 'web-scraping', 'html-parsing'],
    categories: ['web-browser'],
    protocols: ['mcp'],
    docs_url: 'https://github.com/modelcontextprotocol/servers',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://github.com/modelcontextprotocol/servers' },
  },
  {
    slug: 'twilio-mcp',
    name: 'Twilio MCP Server',
    tagline: 'SMS, voice calls, and communication APIs via MCP',
    description: 'Twilio MCP Server for programmable communications. Send SMS messages, make voice calls, manage phone numbers, and access Twilio\'s full communications platform via AI agents.',
    capabilities: ['sms', 'voice', 'communications', 'messaging', 'phone'],
    categories: ['content-media'],
    protocols: ['mcp'],
    docs_url: 'https://twilio.com',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'usage-based',
    metadata: { listing_type: 'community', source_url: 'https://twilio.com' },
  },
  {
    slug: 'openapi-mcp',
    name: 'OpenAPI MCP Server',
    tagline: 'Turn any OpenAPI spec into an MCP server automatically',
    description: 'OpenAPI MCP Server converts any OpenAPI/Swagger specification into a full MCP server. Instantly give AI agents access to any REST API with a standard OpenAPI spec.',
    capabilities: ['api-integration', 'openapi', 'developer-tools', 'rest', 'swagger'],
    categories: ['developer-tools'],
    protocols: ['mcp'],
    docs_url: 'https://github.com/snaggle-ai/openapi-mcp-server',
    owner_id: 'community',
    owner_name: 'AgentDNS Community',
    pricing_model: 'free',
    metadata: { listing_type: 'community', source_url: 'https://github.com/snaggle-ai/openapi-mcp-server' },
  },
];

async function seed() {
  console.log(`\nAgentDNS Community Seed Script`);
  console.log(`Seeding ${AGENTS.length} agents...\n`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  // Insert in batches of 10
  const BATCH_SIZE = 10;
  for (let i = 0; i < AGENTS.length; i += BATCH_SIZE) {
    const batch = AGENTS.slice(i, i + BATCH_SIZE);

    const { data, error } = await supabase
      .from('agents')
      .upsert(batch, { onConflict: 'slug', ignoreDuplicates: true })
      .select('slug');

    if (error) {
      console.error(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, error.message);
      failed += batch.length;
    } else {
      const inserted = data?.length ?? 0;
      const ignored = batch.length - inserted;
      success += inserted;
      skipped += ignored;
      for (const agent of data ?? []) {
        console.log(`  ✓ ${agent.slug}`);
      }
      if (ignored > 0) {
        const insertedSlugs = new Set((data ?? []).map((d: { slug: string }) => d.slug));
        for (const a of batch) {
          if (!insertedSlugs.has(a.slug)) {
            console.log(`  — ${a.slug} (already exists, skipped)`);
          }
        }
      }
    }
  }

  console.log(`\nDone!`);
  console.log(`  Inserted: ${success}`);
  console.log(`  Skipped:  ${skipped} (already existed)`);
  console.log(`  Failed:   ${failed}`);

  if (failed > 0) process.exit(1);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
