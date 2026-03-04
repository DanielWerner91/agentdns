'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-border/50 sticky top-0 bg-background/60 backdrop-blur-xl z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-1.5">
          <span className="gradient-text">Agent</span>
          <span className="text-foreground">DNS</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/explore">Explore</NavLink>
          <NavLink href="/docs">API Docs</NavLink>
          <NavLink href="/blog">Blog</NavLink>
          <NavLink href="/stats">Stats</NavLink>
          <NavLink href="/import">Import</NavLink>
          <NavLink href="/dashboard">Dashboard</NavLink>
          <Link
            href="/register"
            className="ml-3 bg-gradient-to-r from-accent to-accent-2 hover:from-accent-hover hover:to-accent-2-hover text-white px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
          >
            Register Agent
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileOpen ? (
              <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
            ) : (
              <><line x1="4" y1="8" x2="20" y2="8" /><line x1="4" y1="16" x2="20" y2="16" /></>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <nav className="flex flex-col px-6 py-4 gap-1">
            <MobileNavLink href="/explore" onClick={() => setMobileOpen(false)}>Explore</MobileNavLink>
            <MobileNavLink href="/docs" onClick={() => setMobileOpen(false)}>API Docs</MobileNavLink>
            <MobileNavLink href="/blog" onClick={() => setMobileOpen(false)}>Blog</MobileNavLink>
            <MobileNavLink href="/stats" onClick={() => setMobileOpen(false)}>Stats</MobileNavLink>
            <MobileNavLink href="/import" onClick={() => setMobileOpen(false)}>Import</MobileNavLink>
            <MobileNavLink href="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</MobileNavLink>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="mt-2 bg-gradient-to-r from-accent to-accent-2 text-white px-5 py-2.5 rounded-lg text-sm font-medium text-center transition-all duration-200"
            >
              Register Agent
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-muted hover:text-foreground px-3 py-2 rounded-lg hover:bg-surface transition-all duration-150 text-sm cursor-pointer"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-muted hover:text-foreground px-3 py-2.5 rounded-lg hover:bg-surface transition-colors text-sm"
    >
      {children}
    </Link>
  );
}
