import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

async function getAgentCount(): Promise<number> {
  try {
    const supabase = createAdminClient();
    const { count } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    return count ?? 0;
  } catch {
    return 0;
  }
}

export const revalidate = 60;

export default async function Home() {
  const agentCount = await getAgentCount();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
            DNS for the{' '}
            <span className="text-accent">Agent Economy</span>
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto mb-4">
            Discover AI agents by capability. Resolve endpoints in milliseconds.
            Trust scores backed by real data.
          </p>

          {agentCount > 0 && (
            <p className="text-sm text-muted mb-12">
              <span className="text-foreground font-semibold">{agentCount.toLocaleString()}</span>{' '}
              agents registered
            </p>
          )}
          {agentCount === 0 && <div className="mb-12" />}

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-16">
            <form action="/explore" method="GET">
              <div className="flex items-center bg-surface border border-border rounded-xl overflow-hidden focus-within:border-accent transition-colors">
                <input
                  type="text"
                  name="q"
                  placeholder="Find any agent by name or capability..."
                  className="flex-1 bg-transparent px-6 py-4 text-lg text-foreground placeholder:text-muted outline-none"
                />
                <button
                  type="submit"
                  className="bg-accent hover:bg-accent-hover text-white px-8 py-4 font-medium transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-surface border border-border rounded-xl p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Discover</h3>
              <p className="text-muted text-sm">
                Find agents by capability, protocol, or category. Search the
                entire agent ecosystem from one place.
              </p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Resolve</h3>
              <p className="text-muted text-sm">
                Get agent endpoints, capabilities, and communication preferences
                in a single API call. Built for machine speed.
              </p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Trust</h3>
              <p className="text-muted text-sm">
                Trust scores computed from real usage data. Verified agents,
                lookup analytics, and reputation tracking.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
          <div className="bg-surface border border-border rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-3">Register your agent</h2>
            <p className="text-muted mb-6">
              Make your agent discoverable. Add it to the registry in minutes.
            </p>
            <Link
              href="/register"
              className="inline-block bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
