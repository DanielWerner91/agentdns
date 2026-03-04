/**
 * Import AI agents from curated awesome-ai-agents lists.
 * Sources:
 *   - e2b-dev/awesome-ai-agents (215 entries, rich structure)
 *   - slavakurilyak/awesome-ai-agents (additional entries)
 *
 * Usage: npx tsx scripts/import-ai-agents.ts
 */

import { createClient } from '@supabase/supabase-js';
import { loadEnv, getSupabaseCredentials } from './lib/env';
import { autoTagCapabilities } from './lib/auto-tagger';
import { computeInitialTrustScore } from './lib/trust-score';

loadEnv();
const { url, key } = getSupabaseCredentials();
const supabase = createClient(url, key);

const BATCH_SIZE = 50;

// ── Category mapping for e2b list's own categories ──
function mapE2bCategory(raw: string): string[] {
  const cats: string[] = [];
  const r = raw.toLowerCase();
  if (r.includes('code') || r.includes('developer') || r.includes('software') || r.includes('devops')) cats.push('engineering');
  if (r.includes('data') || r.includes('research') || r.includes('analyst') || r.includes('science')) cats.push('data');
  if (r.includes('general') || r.includes('assistant') || r.includes('build your own') || r.includes('multi-agent')) cats.push('engineering');
  if (r.includes('product') || r.includes('work') || r.includes('task') || r.includes('project')) cats.push('productivity');
  if (r.includes('sales') || r.includes('crm') || r.includes('marketing') || r.includes('customer')) cats.push('sales');
  if (r.includes('support') || r.includes('service') || r.includes('chat')) cats.push('support');
  if (r.includes('finance') || r.includes('trading') || r.includes('investment')) cats.push('finance');
  if (r.includes('health') || r.includes('medical') || r.includes('bio')) cats.push('healthcare');
  if (r.includes('legal') || r.includes('law') || r.includes('compliance')) cats.push('legal');
  if (r.includes('education') || r.includes('learn') || r.includes('tutor')) cats.push('education');
  if (r.includes('content') || r.includes('media') || r.includes('creative') || r.includes('writing')) cats.push('content');
  if (r.includes('security') || r.includes('cyber')) cats.push('security');
  if (r.includes('design') || r.includes('ui') || r.includes('ux')) cats.push('design-creative');
  if (r.includes('infrastructure') || r.includes('cloud') || r.includes('devops')) cats.push('infrastructure');
  return cats.length > 0 ? [...new Set(cats)] : ['engineering'];
}

// ── Parse e2b-dev/awesome-ai-agents README ──
function parseE2bReadme(content: string): Array<{
  name: string; url: string; tagline: string; description: string;
  categories: string[]; isOpenSource: boolean; githubUrl: string | null;
}> {
  const entries: ReturnType<typeof parseE2bReadme> = [];
  const blocks = content.split(/^## /m).slice(1); // split on ## headings

  for (const block of blocks) {
    const lines = block.split('\n');
    const headerLine = lines[0];

    // Skip section headers that aren't agent entries (no link pattern)
    const headerMatch = headerLine.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (!headerMatch) continue;

    const name = headerMatch[1].trim();
    const primaryUrl = headerMatch[2].trim();
    if (primaryUrl.startsWith('#') || name.length < 2) continue;

    const tagline = (lines[1] ?? '').trim().replace(/^[*_]+|[*_]+$/g, '');

    // Extract from <details> block
    const detailsMatch = block.match(/<details>([\s\S]*?)<\/details>/i);
    const details = detailsMatch ? detailsMatch[1] : '';

    // Extract Category
    const catMatch = details.match(/###\s+Category\s*\n+([^\n#]+)/);
    const catRaw = catMatch ? catMatch[1].trim() : '';
    const categories = mapE2bCategory(catRaw);

    // Extract Description: lines after "### Description" up to next ###
    const descMatch = details.match(/###\s+Description\s*\n([\s\S]*?)(?=###|$)/);
    let description = '';
    if (descMatch) {
      description = descMatch[1]
        .split('\n')
        .map(l => l.replace(/^[-*]\s+/, '').replace(/\*\*/g, '').trim())
        .filter(l => l.length > 5 && !l.startsWith('<') && !l.startsWith('!'))
        .slice(0, 4)
        .join(' ')
        .substring(0, 500);
    }
    if (!description && tagline) description = tagline;
    if (description.length < 5) continue;

    // Extract GitHub link from Links section
    const linksMatch = details.match(/###\s+Links\s*\n([\s\S]*?)(?=###|$)/);
    let githubUrl: string | null = null;
    if (linksMatch) {
      const ghMatch = linksMatch[1].match(/\[(?:GitHub|Source|Repository)\]\((https:\/\/github\.com\/[^)]+)\)/i);
      if (ghMatch) githubUrl = ghMatch[1];
    }
    if (!githubUrl && primaryUrl.includes('github.com')) githubUrl = primaryUrl;

    // Detect if open source
    const isOpenSource = !block.includes('Closed-source') &&
      (!!githubUrl || block.toLowerCase().includes('open source') || block.toLowerCase().includes('open-source'));

    entries.push({ name, url: primaryUrl, tagline, description, categories, isOpenSource, githubUrl });
  }

  return entries;
}

// ── Parse slavakurilyak/awesome-ai-agents README (HTML-heavy format) ──
// Each entry: ### Name\n<div><a href="URL">...</a></div>\n<p>⭐ stars</p>\n<p>emoji Category</p>\n\n<p>Description</p>
function parseSlavakReadme(content: string): Array<{
  name: string; url: string; description: string; categories?: string[];
}> {
  const entries: Array<{ name: string; url: string; description: string; categories?: string[] }> = [];
  // Split on ### headings (agent entries in "All Projects" section)
  const blocks = content.split(/^### /m).slice(1);

  for (const block of blocks) {
    const lines = block.split('\n');
    const name = lines[0].trim();
    if (!name || name.length < 2) continue;

    // Extract primary URL from first <a href="..."> in the block
    const urlMatch = block.match(/<a href="(https?:\/\/[^"]+)"/);
    if (!urlMatch) continue;
    const url = urlMatch[1].trim();

    // Extract category from <p>emoji Category</p>
    const catMatch = block.match(/<p>[^a-z<]*([A-Z][^<]+)<\/p>/);
    const catRaw = catMatch ? catMatch[1].trim() : '';
    const categories = mapE2bCategory(catRaw);

    // Extract description from last <p>...</p> block
    const descMatches = [...block.matchAll(/<p>([^<]+)<\/p>/g)];
    // Skip star count and category paragraphs, find the real description
    let description = '';
    for (const dm of descMatches) {
      const txt = dm[1].trim();
      if (txt.startsWith('⭐') || txt.startsWith('⌚') || txt.length < 10) continue;
      // Skip if it looks like a category line (short, no sentence)
      if (txt.split(' ').length < 5) continue;
      description = txt.replace(/\.$/, '');
      break;
    }
    if (description.length < 10) continue;

    entries.push({ name, url, description, categories });
  }
  return entries;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 60);
}

async function importSource(
  label: string,
  rawUrl: string,
  parse: (content: string) => Array<{ name: string; url: string; description: string; tagline?: string; categories?: string[]; githubUrl?: string | null; isOpenSource?: boolean }>,
  existingSlugs: Set<string>,
  protocols: string[],
) {
  console.log(`\n── ${label} ──`);
  const res = await fetch(rawUrl);
  if (!res.ok) { console.error(`Failed to fetch: HTTP ${res.status}`); return 0; }
  const entries = parse(await res.text());
  console.log(`Parsed ${entries.length} entries`);

  let inserted = 0;
  let skipped = 0;
  let batch: Record<string, unknown>[] = [];

  for (const entry of entries) {
    const slug = slugify(entry.name);
    if (!slug || slug.length < 2 || existingSlugs.has(slug)) { skipped++; continue; }
    existingSlugs.add(slug);

    const description = entry.description;
    const tagline = entry.tagline ?? description.substring(0, 120);
    const capabilities = autoTagCapabilities(entry.name, description);
    const categories = entry.categories ?? ['engineering'];
    const githubUrl = entry.githubUrl ?? (entry.url.includes('github.com') ? entry.url : null);
    const docsUrl = entry.url.includes('github.com') ? entry.url : null;
    const websiteUrl = !entry.url.includes('github.com') ? entry.url : null;

    const agent: Record<string, unknown> = {
      slug,
      name: entry.name,
      tagline: tagline.substring(0, 300),
      description: description.substring(0, 2000),
      capabilities,
      categories,
      protocols,
      mcp_server_url: null,
      api_endpoint: websiteUrl,
      a2a_endpoint: null,
      docs_url: docsUrl ?? websiteUrl,
      listing_type: 'community',
      owner_id: 'community',
      owner_name: 'AgentDNS Community',
      status: 'active',
      source: 'awesome-ai-agents',
      metadata: {
        source: 'awesome-ai-agents',
        source_url: entry.url,
        ...(githubUrl ? { github_url: githubUrl } : {}),
        is_open_source: entry.isOpenSource ?? true,
      },
      trust_score: 0,
    };
    agent.trust_score = computeInitialTrustScore({
      description: agent.description as string,
      tagline: agent.tagline as string,
      capabilities: agent.capabilities as string[],
      docs_url: agent.docs_url as string | null,
      listing_type: agent.listing_type as string,
      metadata: agent.metadata as Record<string, unknown>,
    });

    batch.push(agent);

    if (batch.length >= BATCH_SIZE) {
      const { error } = await supabase.from('agents').upsert(batch, { onConflict: 'slug', ignoreDuplicates: true });
      if (error) { console.error('Batch error:', error.message); }
      else { inserted += batch.length; process.stdout.write('.'); }
      batch = [];
    }
  }

  if (batch.length > 0) {
    const { error } = await supabase.from('agents').upsert(batch, { onConflict: 'slug', ignoreDuplicates: true });
    if (error) { console.error('Final batch error:', error.message); }
    else inserted += batch.length;
  }

  console.log(`\n  Inserted: ${inserted}, Skipped: ${skipped}`);
  return inserted;
}

// ── GitHub topic search ──
async function importGitHubTopic(
  topic: string,
  existingSlugs: Set<string>,
  defaultCategories: string[],
): Promise<number> {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (GITHUB_TOKEN) headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;

  console.log(`\n── GitHub topic: ${topic} ──`);
  let inserted = 0;
  let skipped = 0;
  let batch: Record<string, unknown>[] = [];
  let page = 1;

  while (page <= 5) { // max 5 pages × 30 = 150 repos per topic
    const res = await fetch(
      `https://api.github.com/search/repositories?q=topic:${topic}&sort=stars&order=desc&per_page=30&page=${page}`,
      { headers }
    );
    if (!res.ok) { console.warn(`GitHub search failed: ${res.status}`); break; }
    const data = await res.json() as {
      items: Array<{
        name: string; full_name: string; html_url: string; description: string | null;
        stargazers_count: number; pushed_at: string; language: string | null; topics: string[];
        homepage: string | null;
      }>;
      total_count: number;
    };
    if (!data.items?.length) break;

    for (const repo of data.items) {
      if (repo.stargazers_count < 50) continue; // skip very low-star repos
      const slug = slugify(repo.name);
      if (!slug || slug.length < 2 || existingSlugs.has(slug)) { skipped++; continue; }
      existingSlugs.add(slug);

      const description = repo.description ?? `${repo.name} - AI agent on GitHub`;
      const tagline = description.substring(0, 120);
      const capabilities = autoTagCapabilities(repo.name, description + ' ' + (repo.topics ?? []).join(' '));
      const agent: Record<string, unknown> = {
        slug,
        name: repo.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        tagline,
        description,
        capabilities,
        categories: defaultCategories,
        protocols: ['rest'],
        mcp_server_url: null,
        api_endpoint: repo.homepage ?? null,
        a2a_endpoint: null,
        docs_url: repo.html_url,
        listing_type: 'community',
        owner_id: 'community',
        owner_name: 'AgentDNS Community',
        status: 'active',
        source: 'github-topics',
        metadata: {
          source: 'github-topics',
          source_url: repo.html_url,
          github_stars: repo.stargazers_count,
          github_pushed_at: repo.pushed_at,
          github_language: repo.language,
          github_topics: repo.topics,
          topic,
        },
        trust_score: 0,
      };
      agent.trust_score = computeInitialTrustScore({
        description: agent.description as string,
        tagline: agent.tagline as string,
        capabilities: agent.capabilities as string[],
        docs_url: agent.docs_url as string | null,
        listing_type: agent.listing_type as string,
        metadata: agent.metadata as Record<string, unknown>,
      });
      // Bonus for stars
      const starBonus = repo.stargazers_count >= 1000 ? 0.10 : repo.stargazers_count >= 100 ? 0.05 : 0.02;
      agent.trust_score = parseFloat(Math.min(0.99, (agent.trust_score as number) + starBonus).toFixed(2));

      batch.push(agent);
      if (batch.length >= BATCH_SIZE) {
        const { error } = await supabase.from('agents').upsert(batch, { onConflict: 'slug', ignoreDuplicates: true });
        if (error) console.error('Batch error:', error.message);
        else { inserted += batch.length; process.stdout.write('.'); }
        batch = [];
      }
    }
    page++;
    await new Promise(r => setTimeout(r, 500)); // respect rate limits
  }

  if (batch.length > 0) {
    const { error } = await supabase.from('agents').upsert(batch, { onConflict: 'slug', ignoreDuplicates: true });
    if (error) console.error('Final batch error:', error.message);
    else inserted += batch.length;
  }

  console.log(`\n  Inserted: ${inserted}, Skipped: ${skipped}`);
  return inserted;
}

async function run() {
  console.log('AI Agents Import');
  console.log('================');

  // Fetch existing slugs
  const { data: existing } = await supabase.from('agents').select('slug').limit(20000);
  const existingSlugs = new Set((existing ?? []).map((r: { slug: string }) => r.slug));
  console.log(`Existing agents: ${existingSlugs.size}`);

  let total = 0;

  // 1. e2b-dev/awesome-ai-agents
  total += await importSource(
    'e2b-dev/awesome-ai-agents',
    'https://raw.githubusercontent.com/e2b-dev/awesome-ai-agents/main/README.md',
    parseE2bReadme,
    existingSlugs,
    ['rest'],
  );

  // 2. slavakurilyak/awesome-ai-agents (HTML format)
  total += await importSource(
    'slavakurilyak/awesome-ai-agents',
    'https://raw.githubusercontent.com/slavakurilyak/awesome-ai-agents/main/README.md',
    parseSlavakReadme,
    existingSlugs,
    ['rest'],
  );

  // 3. GitHub topic search for popular AI agent repos
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (GITHUB_TOKEN) {
    total += await importGitHubTopic('ai-agent', existingSlugs, ['engineering']);
    total += await importGitHubTopic('llm-agent', existingSlugs, ['engineering']);
    total += await importGitHubTopic('autonomous-agent', existingSlugs, ['engineering']);
    total += await importGitHubTopic('ai-assistant', existingSlugs, ['engineering', 'productivity']);
    total += await importGitHubTopic('langchain-agent', existingSlugs, ['engineering']);
    total += await importGitHubTopic('autogen', existingSlugs, ['engineering']);
    total += await importGitHubTopic('crewai', existingSlugs, ['engineering']);
    // New topics
    total += await importGitHubTopic('chatbot', existingSlugs, ['support', 'engineering']);
    total += await importGitHubTopic('rag', existingSlugs, ['data', 'engineering']);
    total += await importGitHubTopic('multi-agent', existingSlugs, ['engineering']);
    total += await importGitHubTopic('agentic', existingSlugs, ['engineering']);
    total += await importGitHubTopic('agent-framework', existingSlugs, ['engineering']);
    total += await importGitHubTopic('conversational-ai', existingSlugs, ['support', 'engineering']);
    total += await importGitHubTopic('function-calling', existingSlugs, ['engineering']);
    total += await importGitHubTopic('langchain', existingSlugs, ['engineering']);
    total += await importGitHubTopic('llamaindex', existingSlugs, ['data', 'engineering']);
  } else {
    console.log('\nSkipping GitHub topic search (no GITHUB_TOKEN set)');
  }

  console.log(`\n=== Total inserted: ${total} ===`);
}

run().catch(console.error);
