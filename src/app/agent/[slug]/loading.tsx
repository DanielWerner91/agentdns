import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function AgentLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full animate-pulse">
        <div className="h-4 w-32 bg-surface rounded mb-6" />
        <div className="flex items-start justify-between gap-6 mb-8">
          <div className="flex-1 space-y-3">
            <div className="h-8 w-64 bg-surface rounded" />
            <div className="h-5 w-96 bg-surface rounded" />
            <div className="flex gap-2">
              <div className="h-6 w-24 bg-surface rounded" />
              <div className="h-6 w-16 bg-surface rounded" />
            </div>
          </div>
          <div className="w-14 h-14 bg-surface rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-32 bg-surface rounded-xl" />
            <div className="h-20 bg-surface rounded-xl" />
            <div className="h-16 bg-surface rounded-xl" />
          </div>
          <div className="space-y-4">
            <div className="h-40 bg-surface rounded-xl" />
            <div className="h-24 bg-surface rounded-xl" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
