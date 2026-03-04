import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-7xl font-bold gradient-text mb-4">404</p>
          <h1 className="text-2xl font-bold mb-2">Page not found</h1>
          <p className="text-muted mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/"
              className="px-5 py-2.5 bg-gradient-to-r from-accent to-accent-2 hover:from-accent-hover hover:to-accent-2-hover text-white rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
            >
              Go Home
            </Link>
            <Link
              href="/explore"
              className="px-5 py-2.5 bg-surface/60 border border-border text-foreground rounded-lg text-sm font-medium hover:border-accent/30 transition-all duration-200 cursor-pointer"
            >
              Explore Agents
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
