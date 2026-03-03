/**
 * Keyword-based capability auto-tagger.
 * Given a name + description, returns up to 6 capability tags.
 */

const RULES: [RegExp, string[]][] = [
  // Databases
  [/\b(postgres|postgresql|mysql|sqlite|supabase|neon|turso|planetscale|cockroach|tidb)\b/i, ['database', 'sql']],
  [/\b(mongodb|nosql|dynamodb|firestore|couchdb|cassandra|cosmosdb)\b/i, ['database', 'nosql']],
  [/\b(redis|cache|caching|memcached|valkey)\b/i, ['caching', 'database']],
  [/\b(vector\s*db|pinecone|weaviate|chroma|qdrant|milvus|pgvector)\b/i, ['vector-search', 'rag']],
  [/\b\bsql\b|\bquery\b.*\bdata\b/i, ['database', 'sql']],

  // Version control
  [/\bgithub\b|\bgit hub\b/i, ['version-control', 'github']],
  [/\bgitlab\b/i, ['version-control', 'gitlab']],
  [/\b(git|version.?control|repository|repo|pull.?request|commit|branch)\b/i, ['version-control']],

  // Communication
  [/\bslack\b/i, ['communication', 'messaging']],
  [/\bdiscord\b/i, ['communication', 'messaging']],
  [/\b(microsoft.?teams|teams)\b/i, ['communication', 'messaging']],
  [/\b(email|gmail|outlook|sendgrid|smtp|mailgun)\b/i, ['email', 'communication']],
  [/\btwilio\b/i, ['communication', 'sms']],

  // Browser / Web
  [/\b(playwright|puppeteer|selenium|cypress|web.?automation)\b/i, ['browser-automation', 'testing']],
  [/\b(scraping|scraper|crawl|web.?scraping)\b/i, ['web-scraping', 'data-extraction']],
  [/\bwebdriver\b/i, ['browser-automation']],

  // Search
  [/\b(web.?search|internet.?search|bing|google.?search|tavily|brave.?search|serper|exa)\b/i, ['web-search', 'research']],
  [/\bperplexity\b/i, ['web-search', 'research']],
  [/\b(search|retrieval)\b/i, ['web-search']],

  // File / Storage
  [/\b(file.?system|filesystem|directory|folder.?management)\b/i, ['file-management']],
  [/\b(s3|google.?cloud.?storage|blob.?storage|r2|object.?storage)\b/i, ['cloud', 'file-management']],

  // Infrastructure / DevOps
  [/\b(docker|container|kubectl|helm|k8s|kubernetes)\b/i, ['infrastructure', 'devops']],
  [/\b(ci.?cd|github.?actions|jenkins|circleci|travis)\b/i, ['devops', 'deployment']],
  [/\b(deploy|deployment|serverless|vercel|netlify|heroku|railway)\b/i, ['deployment', 'devops']],
  [/\bcloudflare\b/i, ['infrastructure', 'cloudflare']],

  // Cloud providers
  [/\b(aws|amazon.?web.?services|ec2|lambda|cloudformation|s3|sqs)\b/i, ['cloud', 'aws']],
  [/\b(google.?cloud|gcp|bigquery|cloud.?run|app.?engine)\b/i, ['cloud', 'gcp']],
  [/\b(azure|microsoft.?azure)\b/i, ['cloud', 'azure']],

  // Monitoring / Observability
  [/\b(grafana|prometheus|datadog|newrelic|dynatrace)\b/i, ['monitoring', 'analytics']],
  [/\b(sentry|bugsnag|error.?tracking|crash.?reporting)\b/i, ['monitoring', 'debugging']],
  [/\b(log|logging|observability|tracing|metrics|telemetry)\b/i, ['monitoring']],

  // Finance / Payments
  [/\bstripe\b/i, ['payments', 'commerce']],
  [/\b(payment|billing|invoice|checkout)\b/i, ['payments', 'commerce']],
  [/\b(stock|trading|crypto|blockchain|forex|finance|investment|portfolio)\b/i, ['financial-data', 'finance']],
  [/\bshopify\b/i, ['commerce', 'payments']],

  // Productivity / Project Management
  [/\bnotion\b/i, ['knowledge-management', 'productivity']],
  [/\b(jira|linear|asana|trello|basecamp|clickup)\b/i, ['project-management', 'issue-tracking']],
  [/\b(todo|todoist|ticktick|things|omnifocus)\b/i, ['task-management', 'productivity']],
  [/\b(calendar|google.?calendar|scheduling|meeting|event)\b/i, ['scheduling', 'calendar']],
  [/\bslack\b/i, ['communication', 'productivity']],

  // Documentation / Knowledge
  [/\b(confluence|wiki|gitbook|notion.?doc|documentation)\b/i, ['documentation', 'knowledge-management']],
  [/\batlassian\b/i, ['project-management', 'documentation']],

  // AI / ML
  [/\b(openai|anthropic|claude|gpt|gemini|llama|mistral|ollama)\b/i, ['ai-ml', 'llm']],
  [/\b(rag|retrieval.?augmented|embedding|embeddings)\b/i, ['rag', 'ai-ml']],
  [/\b(agent|ai.?agent|llm.?agent)\b/i, ['orchestration', 'ai-ml']],
  [/\b(langgraph|langchain|crewai|autogen)\b/i, ['orchestration', 'agent-framework']],

  // Code / Development
  [/\b(code.?gen|code.?generat|code.?review|lint|static.?analysis)\b/i, ['code-generation', 'code-review']],
  [/\b(debug|debugg|breakpoint)\b/i, ['debugging', 'developer-tools']],
  [/\b(test|testing|jest|pytest|mocha|jasmine)\b/i, ['testing']],
  [/\b(npm|package|dependency|sdk)\b/i, ['developer-tools']],

  // NLP / Text
  [/\b(translate|translation|locali[sz]ation|i18n|l10n)\b/i, ['translation', 'nlp']],
  [/\b(summari[sz]|summary|summari[sz]ation)\b/i, ['summarization', 'nlp']],
  [/\b(classify|classif|sentiment|nlp|text.?analys)\b/i, ['classification', 'nlp']],
  [/\b(ocr|optical.?character)\b/i, ['ocr', 'document-analysis']],
  [/\b(pdf|document.?analys|document.?extract|doc.?parsing)\b/i, ['document-analysis']],

  // Image / Media
  [/\b(image.?gen|dall-e|stable.?diffusion|midjourney|imagen|flux)\b/i, ['image-generation']],
  [/\b(vision|image.?analys|computer.?vision|image.?recog)\b/i, ['computer-vision']],
  [/\b(video|youtube|ffmpeg|vid.?gen)\b/i, ['video', 'media']],
  [/\b(voice|tts|text.?to.?speech|speech.?synthesis|elevenlabs|whisper)\b/i, ['voice-synthesis', 'tts']],
  [/\b(music|spotify|playlist|audio.?gen|sound.?gen)\b/i, ['music', 'media']],

  // Design
  [/\b(figma|sketch|adobe|design|ui.?ux|prototype|wireframe)\b/i, ['design', 'ui-ux']],
  [/\b(3d|blender|unity|unreal|game.?dev|modeling)\b/i, ['3d-modeling', 'creative']],

  // Maps / Location
  [/\b(google.?maps|mapbox|geocod|geolocation|navigation|directions|places?)\b/i, ['geolocation', 'maps']],

  // Security
  [/\b(auth|oauth|sso|saml|identity|iam|keycloak)\b/i, ['authentication', 'security']],
  [/\b(security|pentest|vulnerability|cvss|exploit|scan)\b/i, ['security']],

  // Social / CRM
  [/\b(twitter|x\.com|tweet|linkedin|instagram|reddit|mastodon)\b/i, ['social-media']],
  [/\b(salesforce|hubspot|crm|zoho)\b/i, ['crm', 'sales']],
  [/\b(airtable|smartsheet|spreadsheet)\b/i, ['data-management', 'productivity']],

  // Weather / Data
  [/\b(weather|forecast|climate|meteorolog)\b/i, ['weather']],
  [/\b(news|rss|feed|article|podcast)\b/i, ['news', 'content']],

  // Healthcare
  [/\b(healthcare|medical|clinical|ehr|fhir|health.?data|hipaa)\b/i, ['healthcare']],

  // Automation / Workflow
  [/\b(n8n|zapier|make\.com|workflow.?automat|automation)\b/i, ['automation', 'workflow']],
  [/\b(webhook|event.?driven|trigger|integration)\b/i, ['automation', 'integration']],
];

export function autoTagCapabilities(name: string, description: string): string[] {
  const text = `${name} ${description}`;
  const tags = new Set<string>();

  for (const [pattern, capTags] of RULES) {
    if (pattern.test(text)) {
      for (const t of capTags) tags.add(t);
      if (tags.size >= 8) break;
    }
  }

  return Array.from(tags).slice(0, 6);
}

/** Map awesome-mcp-servers category headings to AgentDNS categories */
export function categoryFromHeading(heading: string): string[] {
  const h = heading.toLowerCase();
  if (h.includes('database') || h.includes('data platform')) return ['data'];
  if (h.includes('browser')) return ['developer-tools'];
  if (h.includes('cloud')) return ['infrastructure'];
  if (h.includes('communication')) return ['support'];
  if (h.includes('developer') || h.includes('code')) return ['developer-tools', 'engineering'];
  if (h.includes('finance')) return ['finance'];
  if (h.includes('knowledge') || h.includes('memory')) return ['engineering'];
  if (h.includes('monitoring')) return ['engineering'];
  if (h.includes('productivity') || h.includes('workplace')) return ['productivity'];
  if (h.includes('security')) return ['security'];
  if (h.includes('search')) return ['data'];
  if (h.includes('version control')) return ['engineering'];
  if (h.includes('file')) return ['developer-tools'];
  if (h.includes('science') || h.includes('research')) return ['data'];
  if (h.includes('legal')) return ['legal'];
  if (h.includes('health') || h.includes('bio') || h.includes('medicine')) return ['healthcare'];
  if (h.includes('education') || h.includes('learn')) return ['education'];
  if (h.includes('social')) return ['content'];
  if (h.includes('media') || h.includes('art') || h.includes('music')) return ['content'];
  if (h.includes('travel') || h.includes('location')) return ['content'];
  if (h.includes('marketing') || h.includes('customer')) return ['sales'];
  if (h.includes('support') || h.includes('service')) return ['support'];
  return ['developer-tools'];
}
