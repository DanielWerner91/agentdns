import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function ExploreLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
        {/* Search bar skeleton */}
        <div className="mb-8">
          <div className="h-12 bg-surface border border-border rounded-xl animate-pulse" />
        </div>

        <div className="flex gap-8">
          {/* Sidebar skeleton */}
          <aside className="hidden lg:block w-56 shrink-0 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 bg-surface rounded-lg animate-pulse" />
            ))}
          </aside>

          {/* Cards skeleton */}
          <div className="flex-1 min-w-0">
            <div className="h-5 w-32 bg-surface rounded animate-pulse mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface border border-border rounded-xl p-5 space-y-3 animate-pulse">
                  <div className="flex justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-5 w-40 bg-surface-hover rounded" />
                      <div className="h-4 w-60 bg-surface-hover rounded" />
                    </div>
                    <div className="w-10 h-10 bg-surface-hover rounded-full" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-20 bg-surface-hover rounded-md" />
                    <div className="h-6 w-16 bg-surface-hover rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
