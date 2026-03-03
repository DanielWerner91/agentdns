import type { Metadata } from 'next';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Directory Stats — AgentDNS',
  description: 'Live statistics about the AgentDNS agent directory — total agents, sources, categories, and growth.',
};

export const revalidate = 300;

const SOURCES = [
  { key: 'mcp-registry', label: 'MCP Registry', desc: 'Official registry.modelcontextprotocol.io' },
  { key: 'awesome-mcp-servers', label: 'Awesome MCP Servers', desc: 'Curated community list' },
  { key: 'mcp-official-servers', label: 'Official MCP Servers', desc: 'modelcontextprotocol/servers repo' },
  { key: 'manual', label: 'Owner Registered', desc: 'Submitted via AgentDNS' },
];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 text-center">
      <p className="text-3xl font-bold mb-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-sm font-medium">{label}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}

export default async function StatsPage() {
  const supabase = createAdminClient();

  const [
    { count: totalAgents },
    { count: mcpRegistry },
    { count: awesomeMcp },
    { count: officialMcp },
    { count: ownerRegistered },
    { count: communityListed },
    { count: verified },
    { data: syncLogs },
    { data: recentAgents },
  ] = await Promise.all([
    supabase.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('agents').select('*', { count: 'exact', head: true }).eq('source', 'mcp-registry'),
    supabase.from('agents').select('*', { count: 'exact', head: true }).eq('source', 'awesome-mcp-servers'),
    supabase.from('agents').select('*', { count: 'exact', head: true }).eq('source', 'mcp-official-servers'),
    supabase.from('agents').select('*', { count: 'exact', head: true }).eq('source', 'manual'),
    supabase.from('agents').select('*', { count: 'exact', head: true }).eq('listing_type', 'community'),
    supabase.from('agents').select('*', { count: 'exact', head: true }).eq('listing_type', 'verified'),
    supabase.from('sync_log').select('sync_type, finished_at, inserted, skipped').order('finished_at', { ascending: false }).limit(5),
    supabase.from('agents').select('created_at').order('created_at', { ascending: false }).limit(500),
  ]);

  // Compute 7-day additions
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const addedThisWeek = (recentAgents ?? []).filter(a => new Date(a.created_at) > sevenDaysAgo).length;

  const lastSync = syncLogs?.[0]?.finished_at
    ? new Date(syncLogs[0].finished_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Never';

  const sources = [
    { label: 'MCP Registry', count: mcpRegistry ?? 0, color: 'bg-violet-500' },
    { label: 'Awesome MCP Servers', count: awesomeMcp ?? 0, color: 'bg-blue-500' },
    { label: 'Official MCP Servers', count: officialMcp ?? 0, color: 'bg-emerald-500' },
    { label: 'Owner Registered', count: ownerRegistered ?? 0, color: 'bg-amber-500' },
  ];
  const maxSource = Math.max(...sources.map(s => s.count), 1);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Directory Statistics</h1>
          <p className="text-muted">Live data on the AgentDNS agent registry.</p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Agents" value={totalAgents ?? 0} />
          <StatCard label="Added This Week" value={addedThisWeek} />
          <StatCard label="Owner Verified" value={verified ?? 0} />
          <StatCard label="Community Listed" value={communityListed ?? 0} />
        </div>

        {/* Agents by source */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Agents by Source</h2>
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            {sources.map((s) => (
              <div key={s.label} className="flex items-center gap-4">
                <span className="text-sm text-muted w-44 shrink-0">{s.label}</span>
                <div className="flex-1 bg-background rounded-full h-3 overflow-hidden">
                  <div
                    className={`${s.color} h-full rounded-full transition-all`}
                    style={{ width: `${Math.round((s.count / maxSource) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-16 text-right">{s.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Sources explained */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Data Sources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SOURCES.map((s) => (
              <div key={s.key} className="bg-surface border border-border rounded-xl p-4">
                <p className="font-medium text-sm mb-0.5">{s.label}</p>
                <p className="text-xs text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Last sync */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Sync History</h2>
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            {syncLogs && syncLogs.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Finished</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Inserted</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Skipped</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {syncLogs.map((log, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2.5 font-mono text-xs text-accent">{log.sync_type}</td>
                      <td className="px-4 py-2.5 text-xs text-muted">
                        {log.finished_at ? new Date(log.finished_at).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-right">{(log.inserted ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-xs text-right text-muted">{(log.skipped ?? 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-sm text-muted">
                No syncs yet. Cron runs daily at 3 AM UTC. Last sync: <strong>{lastSync}</strong>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-surface border border-border rounded-xl p-6 text-center">
          <h3 className="font-bold mb-2">Is your agent missing?</h3>
          <p className="text-sm text-muted mb-4">Register it directly or import from a GitHub repo.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/register" className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors">
              Register Agent
            </Link>
            <Link href="/import" className="px-5 py-2.5 border border-border rounded-lg text-sm text-muted hover:text-foreground transition-colors">
              Import from GitHub
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
