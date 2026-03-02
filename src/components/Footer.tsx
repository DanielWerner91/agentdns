import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-sm text-muted">
        <span>AgentDNS</span>
        <div className="flex items-center gap-4">
          <Link href="/explore" className="hover:text-foreground transition-colors">
            Explore
          </Link>
          <span className="text-border">|</span>
          <Link href="/api/v1/health" className="hover:text-foreground transition-colors">
            API
          </Link>
        </div>
      </div>
    </footer>
  );
}
