import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-bold tracking-tight">
              <span className="gradient-text">Agent</span>
              <span className="text-foreground">DNS</span>
            </Link>
            <p className="text-sm text-muted mt-2 max-w-[200px]">
              DNS for the agent economy. Discover, resolve, trust.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Product</h4>
            <div className="flex flex-col gap-2">
              <FooterLink href="/explore">Explore</FooterLink>
              <FooterLink href="/register">Register Agent</FooterLink>
              <FooterLink href="/import">Import</FooterLink>
              <FooterLink href="/stats">Stats</FooterLink>
            </div>
          </div>

          {/* Developers */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Developers</h4>
            <div className="flex flex-col gap-2">
              <FooterLink href="/docs">API Docs</FooterLink>
              <FooterLink href="/integrations">Integrations</FooterLink>
              <FooterLink href="/standards">Standards</FooterLink>
              <FooterLink href="/api/v1/health">API Status</FooterLink>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Resources</h4>
            <div className="flex flex-col gap-2">
              <FooterLink href="/blog">Blog</FooterLink>
              <FooterLink href="/dashboard">Dashboard</FooterLink>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 pt-6 flex items-center justify-between text-xs text-muted">
          <span>AgentDNS</span>
          <span>The open registry for AI agents</span>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm text-muted hover:text-accent transition-colors duration-150">
      {children}
    </Link>
  );
}
