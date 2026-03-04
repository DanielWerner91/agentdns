'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#060918]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-0.5 group">
          <span
            className="transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Agent
          </span>
          <span className="text-white">DNS</span>
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
            className="relative ml-3 group cursor-pointer"
          >
            <span className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg opacity-60 blur-sm group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300">
              Register Agent
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
            </span>
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={`md:hidden fixed inset-0 top-[65px] bg-[#060918]/95 backdrop-blur-xl transition-all duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col px-6 py-6 gap-1">
          {[
            { href: '/explore', label: 'Explore' },
            { href: '/docs', label: 'API Docs' },
            { href: '/blog', label: 'Blog' },
            { href: '/stats', label: 'Stats' },
            { href: '/import', label: 'Import' },
            { href: '/dashboard', label: 'Dashboard' },
          ].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="text-gray-400 hover:text-white px-4 py-3 rounded-xl hover:bg-white/[0.04] transition-all duration-200 text-lg"
              style={{
                opacity: mobileOpen ? 1 : 0,
                transform: mobileOpen ? 'translateX(0)' : 'translateX(-16px)',
                transition: `opacity 300ms ${i * 50}ms, transform 300ms ${i * 50}ms`,
              }}
            >
              {item.label}
            </Link>
          ))}
          <div
            className="mt-4"
            style={{
              opacity: mobileOpen ? 1 : 0,
              transform: mobileOpen ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 300ms 350ms, transform 300ms 350ms',
            }}
          >
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="block bg-gradient-to-r from-cyan-500 to-violet-500 text-white px-5 py-3 rounded-xl text-base font-medium text-center transition-all duration-200"
            >
              Register Agent
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-all duration-200 text-sm cursor-pointer"
    >
      {children}
    </Link>
  );
}
