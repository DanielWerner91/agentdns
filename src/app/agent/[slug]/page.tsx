import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TrustScore } from '@/components/TrustScore';
import { ProtocolBadge } from '@/components/ProtocolBadge';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { CopyButton } from '@/components/CopyButton';
import { JsonViewer } from '@/components/JsonViewer';
import type { Agent } from '@/lib/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('agents')
    .select('name, tagline')
    .eq('slug', slug)
    .single();

  if (!data) {
    return { title: 'Agent Not Found — AgentDNS' };
  }

  return {
    title: `${data.name} — AgentDNS`,
    description: data.tagline ?? `${data.name} on AgentDNS`,
  };
}

async function getAgent(slug: string): Promise<Agent | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('agents')
    .select('id, slug, name, tagline, description, owner_name, owner_url, version, status, capabilities, categories, a2a_endpoint, mcp_server_url, api_endpoint, docs_url, agent_card, protocols, input_formats, output_formats, is_verified, trust_score, total_lookups, pricing_model, pricing_details, tags, metadata, created_at, updated_at')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;

  // Increment lookups (fire-and-forget)
  void supabase.rpc('increment_lookups', { agent_uuid: data.id });

  return data as Agent;
}

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = await getAgent(slug);

  if (!agent) {
    notFound();
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://agentdns.vercel.app';
  const curlCommand = `curl "${baseUrl}/api/v1/agents/${agent.slug}"`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/explore" className="text-sm text-muted hover:text-accent transition-colors">
            &larr; Back to directory
          </Link>
        </div>

        {/* Header section */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold truncate">{agent.name}</h1>
              {agent.is_verified && <VerifiedBadge className="w-6 h-6" />}
            </div>
            {agent.tagline && (
              <p className="text-lg text-muted mb-3">{agent.tagline}</p>
            )}
            <div className="flex items-center gap-3 text-sm text-muted">
              <span className="font-mono text-xs bg-surface px-2 py-1 rounded">{agent.slug}</span>
              <span>v{agent.version}</span>
              <span
                className={`capitalize px-2 py-0.5 rounded text-xs font-medium ${
                  agent.status === 'active'
                    ? 'bg-success/10 text-success'
                    : agent.status === 'deprecated'
                    ? 'bg-warning/10 text-warning'
                    : 'bg-danger/10 text-danger'
                }`}
              >
                {agent.status}
              </span>
            </div>
          </div>
          <TrustScore score={agent.trust_score} size="md" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {agent.description && (
              <section>
                <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Description</h2>
                <div className="prose prose-sm prose-invert max-w-none text-muted leading-relaxed whitespace-pre-wrap">
                  {agent.description}
                </div>
              </section>
            )}

            {/* Capabilities */}
            {agent.capabilities.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Capabilities</h2>
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.map((cap) => (
                    <Link
                      key={cap}
                      href={`/explore?capability=${encodeURIComponent(cap)}`}
                      className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
                    >
                      {cap}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Endpoints */}
            <section>
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Endpoints</h2>
              <div className="space-y-2">
                {agent.a2a_endpoint && (
                  <EndpointRow label="A2A" url={agent.a2a_endpoint} />
                )}
                {agent.mcp_server_url && (
                  <EndpointRow label="MCP Server" url={agent.mcp_server_url} />
                )}
                {agent.api_endpoint && (
                  <EndpointRow label="REST API" url={agent.api_endpoint} />
                )}
                {agent.docs_url && (
                  <EndpointRow label="Docs" url={agent.docs_url} />
                )}
                {!agent.a2a_endpoint && !agent.mcp_server_url && !agent.api_endpoint && !agent.docs_url && (
                  <p className="text-sm text-muted">No endpoints configured.</p>
                )}
              </div>
            </section>

            {/* Agent Card JSON */}
            {agent.agent_card && Object.keys(agent.agent_card).length > 0 && (
              <section>
                <JsonViewer data={agent.agent_card} label="A2A Agent Card" />
              </section>
            )}

            {/* Resolve snippet */}
            <section>
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Resolve this agent</h2>
              <div className="bg-surface border border-border rounded-lg p-4 font-mono text-sm text-muted flex items-center justify-between gap-3">
                <code className="truncate">{curlCommand}</code>
                <CopyButton text={curlCommand} />
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Lookups</p>
                <p className="text-2xl font-bold">{agent.total_lookups.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Trust Score</p>
                <p className="text-2xl font-bold">{Math.round(agent.trust_score * 100)}%</p>
              </div>
              {agent.pricing_model && (
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Pricing</p>
                  <p className="text-sm font-medium capitalize">{agent.pricing_model}</p>
                  {agent.pricing_details && (
                    <p className="text-xs text-muted mt-1">{agent.pricing_details}</p>
                  )}
                </div>
              )}
            </div>

            {/* Protocols */}
            {agent.protocols.length > 0 && (
              <div className="bg-surface border border-border rounded-xl p-5">
                <p className="text-xs text-muted uppercase tracking-wider mb-3">Protocols</p>
                <div className="flex flex-wrap gap-1.5">
                  {agent.protocols.map((p) => (
                    <ProtocolBadge key={p} protocol={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Formats */}
            {(agent.input_formats.length > 0 || agent.output_formats.length > 0) && (
              <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
                {agent.input_formats.length > 0 && (
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider mb-2">Input Formats</p>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.input_formats.map((f) => (
                        <span key={f} className="px-2 py-0.5 bg-background rounded text-xs text-muted font-mono">{f}</span>
                      ))}
                    </div>
                  </div>
                )}
                {agent.output_formats.length > 0 && (
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider mb-2">Output Formats</p>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.output_formats.map((f) => (
                        <span key={f} className="px-2 py-0.5 bg-background rounded text-xs text-muted font-mono">{f}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Categories & Tags */}
            {(agent.categories.length > 0 || agent.tags.length > 0) && (
              <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
                {agent.categories.length > 0 && (
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider mb-2">Categories</p>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.categories.map((c) => (
                        <Link
                          key={c}
                          href={`/explore?category=${encodeURIComponent(c)}`}
                          className="px-2 py-0.5 bg-background rounded text-xs text-muted hover:text-accent transition-colors capitalize"
                        >
                          {c}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {agent.tags.length > 0 && (
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 bg-background rounded text-xs text-muted">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Owner */}
            {(agent.owner_name || agent.owner_url) && (
              <div className="bg-surface border border-border rounded-xl p-5">
                <p className="text-xs text-muted uppercase tracking-wider mb-2">Owner</p>
                {agent.owner_url && /^https?:\/\//i.test(agent.owner_url) ? (
                  <a
                    href={agent.owner_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:text-accent-hover transition-colors"
                  >
                    {agent.owner_name ?? agent.owner_url}
                  </a>
                ) : (
                  <p className="text-sm">{agent.owner_name ?? agent.owner_url}</p>
                )}
              </div>
            )}

            {/* Metadata */}
            {Object.keys(agent.metadata).length > 0 && (
              <JsonViewer data={agent.metadata} label="Metadata" />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function EndpointRow({ label, url }: { label: string; url: string }) {
  return (
    <div className="flex items-center gap-3 bg-surface border border-border rounded-lg px-4 py-3">
      <span className="text-xs font-semibold text-muted uppercase w-20 shrink-0">{label}</span>
      <code className="text-sm text-foreground truncate flex-1 font-mono">{url}</code>
      <CopyButton text={url} />
    </div>
  );
}
