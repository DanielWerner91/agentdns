import { Suspense } from 'react';
import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AgentCard } from '@/components/AgentCard';
import { SearchBar } from '@/components/SearchBar';
import { ExploreFilters } from '@/components/ExploreFilters';
import type { AgentListItem } from '@/lib/types';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Explore Agents — AgentDNS',
  description: 'Browse and search the AI agent directory. Filter by capability, protocol, category, and trust score.',
};

const AGENT_LIST_FIELDS =
  'id, slug, name, tagline, listing_type, capabilities, categories, protocols, is_verified, trust_score, total_lookups, pricing_model, a2a_endpoint, created_at';

interface ExplorePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Escape PostgREST special characters in user input
function sanitizeForPostgrest(input: string): string {
  return input.replace(/[%_\\,.()"']/g, (ch) => `\\${ch}`);
}

async function fetchAgents(searchParams: Record<string, string | string[] | undefined>) {
  const supabase = createAdminClient();

  const q = typeof searchParams.q === 'string' ? searchParams.q : '';
  const capability = typeof searchParams.capability === 'string' ? searchParams.capability : '';
  const category = typeof searchParams.category === 'string' ? searchParams.category : '';
  const protocol = typeof searchParams.protocol === 'string' ? searchParams.protocol : '';
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'relevance';
  const verified = searchParams.verified === 'true';
  const page = Math.max(1, parseInt(typeof searchParams.page === 'string' ? searchParams.page : '1', 10) || 1);
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('agents')
    .select(AGENT_LIST_FIELDS, { count: 'exact' })
    .eq('status', 'active');

  if (q) {
    const safeQ = sanitizeForPostgrest(q);
    query = query.or(`name.ilike.%${safeQ}%,tagline.ilike.%${safeQ}%,description.ilike.%${safeQ}%`);
  }

  if (capability) {
    const caps = capability.split(',').map((c) => c.trim()).filter(Boolean);
    query = query.overlaps('capabilities', caps);
  }

  if (category) {
    query = query.contains('categories', [category]);
  }

  if (protocol) {
    query = query.contains('protocols', [protocol]);
  }

  if (verified) {
    query = query.eq('is_verified', true);
  }

  switch (sort) {
    case 'trust':
      query = query.order('trust_score', { ascending: false });
      break;
    case 'lookups':
      query = query.order('total_lookups', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    default:
      query = query.order('trust_score', { ascending: false }).order('total_lookups', { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count } = await query;

  return {
    agents: (data ?? []) as AgentListItem[],
    total: count ?? 0,
    page,
    limit,
  };
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const resolvedParams = await searchParams;
  const { agents, total, page, limit } = await fetchAgents(resolvedParams);
  const totalPages = Math.ceil(total / limit);
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : '';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            Explore <span className="gradient-text">Agents</span>
          </h1>
          <p className="text-sm text-muted">Browse and search the AI agent directory</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside className="hidden lg:block w-56 shrink-0">
            <Suspense fallback={null}>
              <ExploreFilters />
            </Suspense>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted">
                {total > 0 ? (
                  <>
                    <span className="text-foreground font-medium">{total}</span> agent{total !== 1 ? 's' : ''} found
                    {q && (
                      <>
                        {' '}for &ldquo;<span className="text-accent">{q}</span>&rdquo;
                      </>
                    )}
                  </>
                ) : (
                  <>
                    No agents found
                    {q && (
                      <>
                        {' '}for &ldquo;<span className="text-accent">{q}</span>&rdquo;
                      </>
                    )}
                  </>
                )}
              </p>
            </div>

            {/* Agent grid */}
            {agents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-surface/40 border border-border rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted mb-4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <h3 className="text-lg font-semibold mb-2">No agents found</h3>
                <p className="text-muted text-sm mb-4">
                  Try adjusting your search or filters.
                </p>
                <Link
                  href="/explore"
                  className="text-accent hover:text-accent-hover text-sm font-medium cursor-pointer"
                >
                  Clear all filters
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {page > 1 && (
                  <PaginationLink searchParams={resolvedParams} page={page - 1}>
                    Previous
                  </PaginationLink>
                )}
                <span className="text-sm text-muted px-3">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <PaginationLink searchParams={resolvedParams} page={page + 1}>
                    Next
                  </PaginationLink>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function PaginationLink({
  searchParams,
  page,
  children,
}: {
  searchParams: Record<string, string | string[] | undefined>;
  page: number;
  children: React.ReactNode;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string') params.set(key, value);
  }
  params.set('page', page.toString());

  return (
    <Link
      href={`/explore?${params.toString()}`}
      className="px-4 py-2 bg-surface/60 border border-border rounded-lg text-sm text-muted hover:text-foreground hover:border-accent/30 transition-all duration-150 cursor-pointer"
    >
      {children}
    </Link>
  );
}
