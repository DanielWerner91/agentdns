import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = { title: 'Analytics — AgentDNS Admin' };
export const revalidate = 300; // 5 minutes

// Set your GitHub user ID here to protect the dashboard
// Get it from: curl https://api.github.com/users/YOUR_GITHUB_USERNAME
const ADMIN_GITHUB_IDS = (process.env.ADMIN_GITHUB_IDS ?? '').split(',').filter(Boolean);

interface StatCard {
  label: string;
  value: string | number;
  sub?: string;
}

function StatCard({ label, value, sub }: StatCard) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <p className="text-xs text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}

function SimpleBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted w-40 shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-background rounded-full h-2 overflow-hidden">
        <div
          className="bg-accent h-full rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted w-10 text-right">{value}</span>
    </div>
  );
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/admin/analytics');
  }

  // Check admin access
  if (ADMIN_GITHUB_IDS.length > 0 && !ADMIN_GITHUB_IDS.includes(session.user.id)) {
    redirect('/');
  }

  const supabase = createAdminClient();

  // Fetch stats in parallel
  const [
    { count: totalAgents },
    { count: activeAgents },
    { count: communityAgents },
    { count: totalLookups },
    { data: recentAgents },
    { data: topAgents },
    { data: recentLookups },
  ] = await Promise.all([
    supabase.from('agents').select('*', { count: 'exact', head: true }),
    supabase.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('agents').select('*', { count: 'exact', head: true }).eq('listing_type', 'community'),
    supabase.from('lookup_log').select('*', { count: 'exact', head: true }),
    supabase.from('agents').select('slug, name, created_at, listing_type').order('created_at', { ascending: false }).limit(10),
    supabase.from('agents').select('slug, name, total_lookups').eq('status', 'active').order('total_lookups', { ascending: false }).limit(10),
    supabase.from('lookup_log').select('query_type, created_at').order('created_at', { ascending: false }).limit(200),
  ]);

  // Count lookups by type
  const lookupByType: Record<string, number> = {};
  for (const l of recentLookups ?? []) {
    lookupByType[l.query_type] = (lookupByType[l.query_type] ?? 0) + 1;
  }
  const maxLookupType = Math.max(...Object.values(lookupByType), 1);

  // Registrations this week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thisWeekCount = (recentAgents ?? []).filter(
    (a) => new Date(a.created_at) > oneWeekAgo
  ).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-muted">Internal dashboard · Admin only</p>
          </div>
          <div className="text-xs text-muted bg-surface border border-border px-3 py-1.5 rounded-lg">
            Auto-refreshes every 5 min
          </div>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Agents" value={totalAgents ?? 0} />
          <StatCard label="Active Agents" value={activeAgents ?? 0} />
          <StatCard label="Community Listed" value={communityAgents ?? 0} sub="not owner-verified" />
          <StatCard label="Total Lookups" value={totalLookups ?? 0} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* This week */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">This Week</h2>
            <div className="text-4xl font-bold mb-1">{thisWeekCount}</div>
            <div className="text-sm text-muted">new registrations</div>
          </div>

          {/* Lookup types */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Recent Lookups by Type</h2>
            <div className="space-y-3">
              {Object.entries(lookupByType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
                  <SimpleBar key={type} label={type} value={count} max={maxLookupType} />
                ))}
              {Object.keys(lookupByType).length === 0 && (
                <p className="text-sm text-muted">No lookup data yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Most queried agents */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Most Looked-Up Agents</h2>
            <div className="space-y-2">
              {(topAgents ?? []).map((agent, i) => (
                <div key={agent.slug} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-muted w-5 text-right shrink-0">{i + 1}</span>
                    <a
                      href={`/agent/${agent.slug}`}
                      className="text-accent hover:text-accent-hover truncate"
                    >
                      {agent.name}
                    </a>
                  </div>
                  <span className="text-xs text-muted shrink-0 ml-2">{agent.total_lookups.toLocaleString()}</span>
                </div>
              ))}
              {(topAgents ?? []).length === 0 && (
                <p className="text-sm text-muted">No agents yet</p>
              )}
            </div>
          </div>

          {/* Recent registrations */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Recent Registrations</h2>
            <div className="space-y-2">
              {(recentAgents ?? []).map((agent) => (
                <div key={agent.slug} className="flex items-center justify-between text-sm">
                  <a
                    href={`/agent/${agent.slug}`}
                    className="text-accent hover:text-accent-hover truncate"
                  >
                    {agent.name}
                  </a>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {agent.listing_type === 'community' && (
                      <span className="text-xs text-muted bg-background border border-border px-1.5 py-0.5 rounded">community</span>
                    )}
                    <span className="text-xs text-muted">
                      {new Date(agent.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {(recentAgents ?? []).length === 0 && (
                <p className="text-sm text-muted">No agents yet</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
