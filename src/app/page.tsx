import Link from 'next/link';
import { Suspense } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchBar } from '@/components/SearchBar';

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
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Retro grid background */}
          <div className="retro-grid" />

          {/* Radial glow accents */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.08)_0%,_transparent_70%)] pointer-events-none" />
          <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.06)_0%,_transparent_70%)] pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-6 pt-28 pb-20 text-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface/50 backdrop-blur-sm text-xs text-muted mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              The open registry for AI agents
            </div>

            {/* Main headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              DNS for the{' '}
              <span className="gradient-text-animated">Agent Economy</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-4 leading-relaxed">
              Discover AI agents by capability. Resolve endpoints in milliseconds.
              Trust scores backed by real data.
            </p>

            {agentCount > 0 && (
              <p className="text-sm text-muted mb-10">
                <span className="text-accent font-semibold">{agentCount.toLocaleString()}</span>{' '}
                agents registered and counting
              </p>
            )}
            {agentCount === 0 && <div className="mb-10" />}

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-6">
              <Suspense fallback={null}>
                <SearchBar
                  size="large"
                  placeholder="Find any agent by name or capability..."
                />
              </Suspense>
            </div>

            {/* Quick search suggestions */}
            <div className="flex flex-wrap justify-center gap-2 mb-16">
              {['contract-review', 'code-generation', 'data-analysis', 'image-generation'].map((cap) => (
                <Link
                  key={cap}
                  href={`/explore?capability=${cap}`}
                  className="px-3 py-1.5 rounded-full border border-border bg-surface/50 text-xs text-muted hover:text-accent hover:border-accent/30 transition-all duration-150 cursor-pointer"
                >
                  {cap}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FeatureCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              }
              title="Discover"
              description="Find agents by capability, protocol, or category. Search the entire agent ecosystem from one place."
              gradient="from-accent/20 to-accent/5"
            />
            <FeatureCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              }
              title="Resolve"
              description="Get agent endpoints, capabilities, and communication preferences in a single API call. Built for machine speed."
              gradient="from-accent-2/20 to-accent-2/5"
            />
            <FeatureCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              }
              title="Trust"
              description="Trust scores computed from real usage data. Verified agents, lookup analytics, and reputation tracking."
              gradient="from-success/20 to-success/5"
            />
          </div>
        </section>

        {/* API Preview */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="bg-surface/60 border border-border rounded-2xl p-8 md:p-12 glow-cyan">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                  One API call to{' '}
                  <span className="gradient-text">resolve any agent</span>
                </h2>
                <p className="text-muted mb-6 leading-relaxed">
                  Query by capability, get back endpoints, trust scores, and protocol details.
                  Built for machine-to-machine communication.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/docs"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-accent to-accent-2 hover:from-accent-hover hover:to-accent-2-hover text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                  >
                    Read the docs
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </Link>
                  <Link
                    href="/explore"
                    className="inline-flex items-center gap-2 border border-border hover:border-accent/40 text-foreground px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                  >
                    Browse agents
                  </Link>
                </div>
              </div>
              <div className="bg-background/80 border border-border rounded-xl p-5 font-mono text-sm overflow-x-auto">
                <div className="text-muted mb-1">$ curl</div>
                <div className="text-accent">GET /api/v1/resolve</div>
                <div className="text-muted ml-4">?capability=<span className="text-foreground">contract-review</span></div>
                <div className="text-muted ml-4">&amp;protocol=<span className="text-foreground">a2a</span></div>
                <div className="mt-3 text-muted">{'{'}</div>
                <div className="ml-4"><span className="text-accent-2">&quot;matches&quot;</span>: [{'{'}</div>
                <div className="ml-8"><span className="text-accent-2">&quot;name&quot;</span>: <span className="text-success">&quot;LegalReview AI&quot;</span>,</div>
                <div className="ml-8"><span className="text-accent-2">&quot;trust_score&quot;</span>: <span className="text-warning">0.94</span>,</div>
                <div className="ml-8"><span className="text-accent-2">&quot;a2a_endpoint&quot;</span>: <span className="text-success">&quot;https://...&quot;</span></div>
                <div className="ml-4">{'}'}]</div>
                <div className="text-muted">{'}'}</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
          <div className="relative bg-surface/60 border border-border rounded-2xl p-10 overflow-hidden">
            {/* Subtle gradient accent line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Register your agent
            </h2>
            <p className="text-muted mb-8 max-w-lg mx-auto">
              Make your agent discoverable to the entire ecosystem.
              Add it to the registry in minutes.
            </p>
            <Link
              href="/register"
              className="inline-block bg-gradient-to-r from-accent to-accent-2 hover:from-accent-hover hover:to-accent-2-hover text-white px-8 py-3.5 rounded-lg font-medium transition-all duration-200 cursor-pointer"
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

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="bg-surface/60 border border-border rounded-xl p-6 card-lift glow-border">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-accent mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
