import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { FeatureCards } from '@/components/FeatureCards';
import { ArrowRight } from 'lucide-react';

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
        <HeroSection agentCount={agentCount} />

        {/* Feature Cards */}
        <section className="max-w-5xl mx-auto px-6 pb-20 -mt-8">
          <FeatureCards />
        </section>

        {/* API Preview */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 md:p-12 overflow-hidden group hover:border-white/[0.12] transition-colors duration-500">
            {/* Subtle glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-cyan-500/[0.04] blur-[80px] rounded-full" />

            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                  One API call to{' '}
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    resolve any agent
                  </span>
                </h2>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Query by capability, get back endpoints, trust scores, and protocol details.
                  Built for machine-to-machine communication.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/docs"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer"
                  >
                    Read the docs
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/explore"
                    className="inline-flex items-center gap-2 border border-white/10 hover:border-cyan-500/30 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer"
                  >
                    Browse agents
                  </Link>
                </div>
              </div>
              <div className="bg-[#060918]/80 border border-white/[0.06] rounded-xl p-5 font-mono text-sm overflow-x-auto">
                <div className="text-gray-500 mb-1">$ curl</div>
                <div className="text-cyan-400">GET /api/v1/resolve</div>
                <div className="text-gray-500 ml-4">?capability=<span className="text-gray-200">contract-review</span></div>
                <div className="text-gray-500 ml-4">&amp;protocol=<span className="text-gray-200">a2a</span></div>
                <div className="mt-3 text-gray-500">{'{'}</div>
                <div className="ml-4"><span className="text-violet-400">&quot;matches&quot;</span>: [{'{'}</div>
                <div className="ml-8"><span className="text-violet-400">&quot;name&quot;</span>: <span className="text-emerald-400">&quot;LegalReview AI&quot;</span>,</div>
                <div className="ml-8"><span className="text-violet-400">&quot;trust_score&quot;</span>: <span className="text-amber-400">0.94</span>,</div>
                <div className="ml-8"><span className="text-violet-400">&quot;a2a_endpoint&quot;</span>: <span className="text-emerald-400">&quot;https://...&quot;</span></div>
                <div className="ml-4">{'}'}]</div>
                <div className="text-gray-500">{'}'}</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
          <div className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-10 overflow-hidden group hover:border-white/[0.12] transition-colors duration-500">
            {/* Gradient accent line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[200px] h-[150px] bg-violet-500/[0.04] blur-[60px] rounded-full" />

            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                Register your agent
              </h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Make your agent discoverable to the entire ecosystem.
                Add it to the registry in minutes.
              </p>
              <Link
                href="/register"
                className="relative inline-flex items-center gap-2 group/btn cursor-pointer"
              >
                <span className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg opacity-60 blur-sm group-hover/btn:opacity-100 transition-opacity duration-300" />
                <span className="relative bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white px-8 py-3.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
