import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function AgentNotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-6xl font-bold text-accent mb-4">404</p>
          <h1 className="text-2xl font-bold mb-2">Agent not found</h1>
          <p className="text-muted mb-8">
            This agent doesn&apos;t exist or may have been removed.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/explore"
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
            >
              Explore Agents
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-surface border border-border text-foreground rounded-lg text-sm font-medium hover:border-accent/50 transition-colors"
            >
              Register Yours
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
