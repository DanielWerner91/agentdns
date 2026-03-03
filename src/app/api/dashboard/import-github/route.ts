import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { autoTagCapabilities } from '@/lib/auto-tagger';

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 60);
}

function extractFromReadme(readme: string): { tagline: string; description: string } {
  const lines = readme.split('\n').filter(l => l.trim());
  // First non-heading, non-badge line as tagline
  let tagline = '';
  let description = '';
  let inBody = false;
  for (const line of lines) {
    if (line.startsWith('#')) continue;
    if (line.includes('badge') || line.includes('shields.io') || line.includes('![')) continue;
    if (!tagline && line.length > 10) {
      tagline = line.replace(/[*_`]/g, '').trim().substring(0, 300);
      continue;
    }
    if (tagline && line.length > 10 && !inBody) {
      description = line.replace(/[*_`]/g, '').trim();
      inBody = true;
    }
  }
  return { tagline, description };
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: { code: 'unauthorized', message: 'Sign in required' } }, { status: 401 });
  }

  let body: { url?: string };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: { code: 'invalid_json' } }, { status: 400 }); }

  const { url } = body;
  if (!url) return NextResponse.json({ error: { code: 'missing_url' } }, { status: 400 });

  // Parse GitHub URL
  const githubMatch = url.match(/github\.com\/([^/]+)\/([^/?\s#]+)/);
  if (!githubMatch) {
    return NextResponse.json({ error: { code: 'invalid_url', message: 'Must be a GitHub repo URL' } }, { status: 400 });
  }
  const [, owner, repo] = githubMatch;
  const repoName = repo.replace(/\.git$/, '');

  try {
    // Fetch repo metadata
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
      headers: { 'User-Agent': 'AgentDNS/1.0', Accept: 'application/vnd.github.v3+json' },
    });
    if (!repoRes.ok) {
      return NextResponse.json({ error: { code: 'github_error', message: 'Could not fetch repo' } }, { status: 404 });
    }
    const repoData = await repoRes.json() as {
      name: string; description: string | null; homepage: string | null;
      stargazers_count: number; topics: string[]; default_branch: string;
    };

    // Try to fetch agentdns.json first, then package.json, then README
    let agentDnsJson: Record<string, unknown> | null = null;
    let packageJson: { name?: string; description?: string; keywords?: string[] } | null = null;
    let readmeText = '';

    const branch = repoData.default_branch;
    const raw = `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}`;

    const [agentDnsRes, packageRes, readmeRes] = await Promise.allSettled([
      fetch(`${raw}/agentdns.json`),
      fetch(`${raw}/package.json`),
      fetch(`${raw}/README.md`),
    ]);

    if (agentDnsRes.status === 'fulfilled' && agentDnsRes.value.ok) {
      try { agentDnsJson = await agentDnsRes.value.json(); } catch { /* ignore */ }
    }
    if (packageRes.status === 'fulfilled' && packageRes.value.ok) {
      try { packageJson = await packageRes.value.json(); } catch { /* ignore */ }
    }
    if (readmeRes.status === 'fulfilled' && readmeRes.value.ok) {
      readmeText = await readmeRes.value.text();
    }

    // Build pre-populated form data
    const { tagline: readmeTagline, description: readmeDesc } = extractFromReadme(readmeText);

    const name = (agentDnsJson?.name as string) || repoData.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const slug = slugify((agentDnsJson?.slug as string) || repoData.name);
    const tagline = (agentDnsJson?.tagline as string) || repoData.description || packageJson?.description || readmeTagline || '';
    const description = readmeText.substring(0, 2000) || readmeDesc;

    const topicCaps = (repoData.topics ?? []).concat(packageJson?.keywords ?? []);
    const autoTags = autoTagCapabilities(name, tagline + ' ' + topicCaps.join(' '));
    const capabilities = ((agentDnsJson?.capabilities as string[]) ?? autoTags).slice(0, 6);

    const protocols = (agentDnsJson?.protocols as string[]) ?? (['mcp'] as string[]);
    const a2aEndpoint = (agentDnsJson?.endpoints as Record<string, string>)?.a2a
      ?? (repoData.homepage ? `${repoData.homepage}/.well-known/agent.json` : null);
    const mcpServerUrl = (agentDnsJson?.endpoints as Record<string, string>)?.mcp ?? null;
    const apiEndpoint = (agentDnsJson?.endpoints as Record<string, string>)?.rest ?? null;

    return NextResponse.json({
      prefill: {
        name,
        slug,
        tagline: tagline.substring(0, 300),
        description,
        capabilities: capabilities.join(', '),
        protocols,
        a2a_endpoint: a2aEndpoint,
        mcp_server_url: mcpServerUrl,
        api_endpoint: apiEndpoint,
        docs_url: url,
      },
      github: {
        stars: repoData.stargazers_count,
        topics: repoData.topics,
        owner,
        repo: repoName,
      },
    });
  } catch (e) {
    console.error('GitHub import error:', e);
    return NextResponse.json({ error: { code: 'fetch_error', message: 'Failed to fetch repo data' } }, { status: 500 });
  }
}
