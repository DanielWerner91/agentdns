/**
 * Backfill categories for all agents. Ensures EVERY agent has at least one category.
 * Three-tier approach:
 *   1. Map capabilities → categories
 *   2. Keyword-match name/tagline/description → categories
 *   3. Fallback based on protocol/source if still empty
 *
 * Usage: npx tsx scripts/backfill-categories.ts
 */

import { createClient } from '@supabase/supabase-js';
import { loadEnv, getSupabaseCredentials } from './lib/env';

loadEnv();
const { url, key } = getSupabaseCredentials();
const supabase = createClient(url, key);

// ── Tier 1: Capability tag → category mappings ──
const CAP_TO_CATS: [string[], string[]][] = [
  [['database','sql','nosql','vector-search','data-extraction','analytics','bigquery'], ['data']],
  [['web-scraping','web-search','research'], ['data']],
  [['rag'], ['data','engineering']],
  [['ai-ml','llm','orchestration','agent-framework'], ['engineering']],
  [['code-generation','code-review','debugging','testing'], ['engineering']],
  [['nlp','summarization','classification','ocr','document-analysis','translation'], ['engineering']],
  [['monitoring'], ['engineering']],
  [['version-control','github','gitlab'], ['developer-tools','engineering']],
  [['browser-automation','webdriver'], ['developer-tools']],
  [['file-management','developer-tools'], ['developer-tools']],
  [['infrastructure','devops','deployment','cloud','aws','gcp','azure','cloudflare'], ['infrastructure']],
  [['automation','workflow','integration'], ['productivity']],
  [['project-management','issue-tracking','task-management'], ['productivity']],
  [['scheduling','calendar','knowledge-management'], ['productivity']],
  [['caching'], ['infrastructure']],
  [['financial-data','finance','payments','commerce'], ['finance']],
  [['image-generation','video','music','voice-synthesis','tts'], ['content']],
  [['computer-vision'], ['content','engineering']],
  [['news'], ['content']],
  [['communication','messaging','email','sms'], ['support']],
  [['crm','sales'], ['sales']],
  [['social-media'], ['sales','content']],
  [['authentication','security'], ['security']],
  [['healthcare'], ['healthcare']],
  [['design','ui-ux','3d-modeling','creative'], ['design-creative']],
  [['geolocation','maps'], ['data']],
];

// ── Tier 2: Keyword → categories for text matching ──
// Expanded significantly to catch more agents
const TEXT_RULES: [RegExp, string[]][] = [
  // Developer tools / Engineering
  [/\b(code|coding|compiler|ide|editor|linter|formatter|debug|devtool|dev.?tool)\b/i, ['developer-tools']],
  [/\b(github|gitlab|bitbucket|git\b|repository|commit|pull.?request|ci.?cd)\b/i, ['developer-tools']],
  [/\b(docker|kubernetes|k8s|container|terraform|ansible|helm|nginx)\b/i, ['infrastructure']],
  [/\b(aws|gcp|azure|cloud|serverless|lambda|s3|ec2|vercel|netlify|heroku)\b/i, ['infrastructure']],
  [/\b(api|endpoint|sdk|cli|terminal|command.?line|shell|bash|npm|pip|package)\b/i, ['developer-tools']],
  [/\b(browser|chrome|firefox|puppeteer|playwright|selenium|scrape|crawl)\b/i, ['developer-tools']],
  [/\b(test|testing|unit.?test|e2e|cypress|jest|mocha|pytest|spec)\b/i, ['developer-tools']],
  [/\b(database|sql|postgres|mysql|mongo|redis|supabase|firebase|dynamo)\b/i, ['data']],
  [/\b(vector|embedding|similarity|qdrant|pinecone|weaviate|chroma|milvus)\b/i, ['data','engineering']],
  [/\b(search|elastic|solr|algolia|typesense|meilisearch)\b/i, ['data']],
  [/\b(llm|language.?model|gpt|claude|gemini|llama|mistral|openai|anthropic)\b/i, ['engineering']],
  [/\b(ai|artificial.?intelligence|machine.?learning|ml|deep.?learning|neural)\b/i, ['engineering']],
  [/\b(agent|autonomous|multi.?agent|orchestrat|chain|prompt|rag|retrieval)\b/i, ['engineering']],
  [/\b(nlp|natural.?language|sentiment|tokeniz|parse|ner|text.?analysis)\b/i, ['engineering']],
  [/\b(transform|convert|format|markdown|json|xml|yaml|csv|pdf)\b/i, ['developer-tools']],
  [/\b(file|filesystem|directory|upload|download|storage|blob|s3)\b/i, ['developer-tools']],
  [/\b(log|logging|trace|observ|telemetry|metric|monitor|alert)\b/i, ['infrastructure']],
  [/\b(auth|oauth|jwt|token|session|identity|password|login|sso|saml)\b/i, ['security']],
  [/\b(encrypt|decrypt|cipher|hash|sign|certificate|ssl|tls|security|firewall|vulnerability)\b/i, ['security']],

  // Productivity / Automation
  [/\b(automat|workflow|pipelin|schedule|cron|task|todo|project.?manage)\b/i, ['productivity']],
  [/\b(calendar|meeting|email|mail|inbox|notification|reminder|note)\b/i, ['productivity']],
  [/\b(slack|discord|teams|telegram|whatsapp|chat|messag|communicat)\b/i, ['support']],
  [/\b(notion|obsidian|roam|wiki|knowledge.?base|documentation|doc)\b/i, ['productivity']],
  [/\b(jira|linear|asana|trello|clickup|monday|basecamp|issue.?track)\b/i, ['productivity']],
  [/\b(spreadsheet|excel|sheets|table|csv|report|dashboard|analytics)\b/i, ['data']],

  // Content / Creative
  [/\b(image|photo|picture|visual|camera|vision|ocr|screenshot)\b/i, ['content']],
  [/\b(video|youtube|vimeo|stream|media|playback|subtitle)\b/i, ['content']],
  [/\b(audio|music|sound|voice|speech|tts|podcast|spotify)\b/i, ['content']],
  [/\b(writing|blog|article|content|cms|wordpress|medium|post)\b/i, ['content']],
  [/\b(design|figma|sketch|canva|ui|ux|prototype|mockup|layout|css)\b/i, ['design-creative']],
  [/\b(3d|animation|render|blender|unity|game|gaming)\b/i, ['design-creative','content']],

  // Domain-specific
  [/\b(legal|law|contract|compliance|gdpr|attorney|court|regulation)\b/i, ['legal']],
  [/\b(educat|learn|tutor|course|student|teach|school|quiz|exam|training)\b/i, ['education']],
  [/\b(ecommerce|e-commerce|shopify|woocommerce|retail|product.?catalog|store|cart|checkout)\b/i, ['sales','finance']],
  [/\b(medical|clinical|patient|diagnosis|health|hospital|doctor|ehr|fhir|pharma|drug)\b/i, ['healthcare']],
  [/\b(finance|financial|banking|trading|invest|stock|crypto|bitcoin|blockchain|payment|stripe|paypal)\b/i, ['finance']],
  [/\b(travel|hotel|flight|booking|airbnb|trip|tourism)\b/i, ['content']],
  [/\b(recipe|food|cook|restaurant|meal|nutrition)\b/i, ['content']],
  [/\b(real.?estate|property|mortgage|zillow|rent|lease)\b/i, ['finance']],
  [/\b(news|journal|rss|feed|press)\b/i, ['content']],
  [/\b(crm|salesforce|hubspot|customer|lead|marketing|campaign|seo|ad|advertis)\b/i, ['sales']],
  [/\b(support|helpdesk|ticket|zendesk|intercom|freshdesk|customer.?service)\b/i, ['support']],
  [/\b(weather|forecast|climate|temperature)\b/i, ['data']],
  [/\b(map|location|geo|gps|address|geocod|navigation|route)\b/i, ['data']],
  [/\b(math|calculat|statistic|scientific|compute|numerical)\b/i, ['engineering']],
];

// ── Tier 3: Fallback based on protocol/source ──
function fallbackCategory(protocols: string[], source: string): string[] {
  if (protocols.includes('mcp')) return ['developer-tools'];
  if (source === 'huggingface') return ['engineering'];
  if (source === 'github-topics') return ['engineering'];
  if (source === 'awesome-ai-agents') return ['engineering'];
  return ['developer-tools']; // ultimate fallback
}

function deriveCategories(agent: {
  capabilities: string[];
  name: string;
  tagline?: string | null;
  description?: string | null;
  protocols?: string[];
  source?: string;
}): string[] {
  const cats = new Set<string>();

  // Tier 1: Map capabilities
  const capSet = new Set(agent.capabilities ?? []);
  for (const [caps, assignedCats] of CAP_TO_CATS) {
    if (caps.some(c => capSet.has(c))) {
      for (const cat of assignedCats) cats.add(cat);
    }
  }

  // Tier 2: Keyword-match text
  const text = `${agent.name} ${agent.tagline ?? ''} ${agent.description ?? ''}`;
  for (const [pattern, assignedCats] of TEXT_RULES) {
    if (pattern.test(text)) {
      for (const cat of assignedCats) cats.add(cat);
    }
  }

  // Tier 3: Fallback — ensure every agent gets at least one category
  if (cats.size === 0) {
    for (const cat of fallbackCategory(agent.protocols ?? [], agent.source ?? '')) {
      cats.add(cat);
    }
  }

  return Array.from(cats);
}

async function run() {
  console.log('Category Backfill (full coverage)');
  console.log('=================================');

  let updated = 0;
  let kept = 0;
  let errors = 0;
  let offset = 0;
  const CHUNK = 1000;

  while (true) {
    const { data: agents, error } = await supabase
      .from('agents')
      .select('id, slug, name, tagline, description, capabilities, categories, protocols, source')
      .order('id')
      .range(offset, offset + CHUNK - 1);

    if (error) { console.error('DB error:', error.message); process.exit(1); }
    if (!agents || agents.length === 0) break;

    const batch: { id: string; categories: string[] }[] = [];

    for (const agent of agents) {
      const newCats = deriveCategories(agent as {
        capabilities: string[];
        name: string;
        tagline?: string | null;
        description?: string | null;
        protocols?: string[];
        source?: string;
      });

      const existing = (agent.categories ?? []) as string[];

      // Always update if empty, or if derived categories are different
      if (existing.length > 0) {
        const existingSorted = [...existing].sort().join(',');
        const newSorted = [...newCats].sort().join(',');
        if (existingSorted === newSorted) { kept++; continue; }
      }

      batch.push({ id: agent.id as string, categories: newCats });
    }

    for (const item of batch) {
      const { error: updateError } = await supabase
        .from('agents')
        .update({ categories: item.categories })
        .eq('id', item.id);
      if (updateError) { errors++; } else { updated++; }
    }

    process.stdout.write(`\rProcessed ${offset + agents.length} agents — updated: ${updated}, kept: ${kept}, errors: ${errors}`);
    offset += CHUNK;
    if (agents.length < CHUNK) break;
  }

  console.log('\n');
  console.log('--- Results ---');
  console.log(`Updated: ${updated}`);
  console.log(`Kept:    ${kept}`);
  console.log(`Errors:  ${errors}`);
}

run().catch(console.error);
