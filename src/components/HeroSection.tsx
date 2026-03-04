'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface HeroSectionProps {
  agentCount: number;
}

export function HeroSection({ agentCount }: HeroSectionProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 z-0">
        {/* Perspective grid */}
        <div ref={gridRef} className="absolute inset-0 overflow-hidden" style={{ perspective: '500px' }}>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(6, 182, 212, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.07) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              transform: 'rotateX(55deg) translateY(-50%)',
              transformOrigin: 'center top',
              height: '200%',
              width: '150%',
              left: '-25%',
              animation: 'grid-flow 20s linear infinite',
            }}
          />
        </div>

        {/* Radial glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-cyan-500/[0.07] blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-500/[0.05] blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full bg-cyan-500/[0.04] blur-[80px]" />

        {/* Floating particles */}
        {mounted && (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-cyan-400/30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float-particle ${6 + Math.random() * 8}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#060918] to-transparent" />
      </div>

      {/* Content */}
      <div
        className={`relative z-10 max-w-4xl mx-auto px-6 text-center transition-all duration-1000 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm text-xs text-gray-400 mb-8 group cursor-pointer hover:border-cyan-500/30 transition-colors duration-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          The open registry for AI agents
          <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform duration-300" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.08]">
          <span className="inline-block" style={{
            background: 'linear-gradient(180deg, #f1f5f9 0%, rgba(241,245,249,0.6) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            DNS for the{' '}
          </span>
          <br className="hidden sm:block" />
          <span
            className="inline-block"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 40%, #ec4899 70%, #06b6d4 100%)',
              backgroundSize: '300% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient-shift 8s ease-in-out infinite',
            }}
          >
            Agent Economy
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
          Discover AI agents by capability. Resolve endpoints in milliseconds.
          Trust scores backed by real data.
        </p>

        {/* Agent count */}
        {agentCount > 0 && (
          <p className="text-sm text-gray-500 mb-10">
            <span className="text-cyan-400 font-semibold tabular-nums">{agentCount.toLocaleString()}</span>{' '}
            agents registered and counting
          </p>
        )}
        {agentCount === 0 && <div className="mb-10" />}

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-6">
          <div className="relative group">
            {/* Glow ring behind search */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-cyan-500/20 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm group-focus-within:border-cyan-500/40 transition-all duration-300">
              <div className="pl-5 text-gray-500">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find any agent by name or capability..."
                className="flex-1 bg-transparent px-4 py-4 sm:py-5 text-base sm:text-lg text-white placeholder:text-gray-500 outline-none"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white px-6 sm:px-8 py-4 sm:py-5 font-medium text-sm sm:text-base transition-all duration-300 cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Quick search pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {['contract-review', 'code-generation', 'data-analysis', 'image-generation'].map((cap, i) => (
            <Link
              key={cap}
              href={`/explore?capability=${cap}`}
              className="px-3.5 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-xs text-gray-500 hover:text-cyan-400 hover:border-cyan-500/20 hover:bg-cyan-500/[0.05] transition-all duration-300 cursor-pointer"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {cap}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
