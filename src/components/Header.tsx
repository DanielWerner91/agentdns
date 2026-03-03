import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-accent">Agent</span>DNS
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/explore" className="text-muted hover:text-foreground transition-colors text-sm">Explore</Link>
          <Link href="/docs" className="text-muted hover:text-foreground transition-colors text-sm">API Docs</Link>
          <Link href="/blog" className="text-muted hover:text-foreground transition-colors text-sm">Blog</Link>
          <Link href="/stats" className="text-muted hover:text-foreground transition-colors text-sm">Stats</Link>
          <Link href="/import" className="text-muted hover:text-foreground transition-colors text-sm">Import</Link>
          <Link href="/dashboard" className="text-muted hover:text-foreground transition-colors text-sm">Dashboard</Link>
          <Link href="/register" className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Register Agent</Link>
        </nav>
      </div>
    </header>
  );
}
