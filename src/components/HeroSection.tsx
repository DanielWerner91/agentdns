'use client';

import React, { useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import ShaderBackground from '@/components/ui/shader-background';
import { NumberTicker } from '@/components/ui/number-ticker';

/* ─── Cinematic Text Reveal (from 21st.dev TextReveal) ─── */
/* Pure CSS letter-by-letter blur reveal with cubic-bezier easing */
const CinematicText: React.FC<{
  text: string;
  className?: string;
  charOffset?: number;
}> = ({ text, className, charOffset = 0 }) => {
  return (
    <span className={cn('inline-flex flex-wrap justify-center', className)} aria-label={text}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="cinematic-char inline-block"
          style={{ '--index': i + charOffset } as React.CSSProperties}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

/* ─── Main Hero ─── */
interface HeroSectionProps {
  agentCount: number;
}

export function HeroSection({ agentCount }: HeroSectionProps) {
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (searchValue.trim()) params.set('q', searchValue.trim());
      router.push(`/explore?${params.toString()}`);
    },
    [searchValue, router]
  );

  const quickSearchItems = [
    'contract-review',
    'code-generation',
    'data-analysis',
    'image-generation',
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* WebGL Shader Background — the real deal */}
      <ShaderBackground className="absolute inset-0 w-full h-full" />

      {/* Overlay to darken center for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060918]/40 via-[#060918]/60 to-[#060918]/90 pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-14"
        >
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-white/[0.1] bg-white/[0.05] backdrop-blur-md">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="text-sm text-gray-300 font-medium tracking-wide">
              The open registry for AI agents
            </span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400/60" />
          </div>
        </motion.div>

        {/* Headline — cinematic letter-by-letter blur reveal */}
        <h1 className="text-center text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.05] mb-8 tracking-tight">
          <CinematicText
            text="DNS for the"
            className="text-white"
            charOffset={0}
          />
          <br />
          <CinematicText
            text="Agent Economy"
            className="bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"
            charOffset={12}
          />
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center text-gray-400 text-lg md:text-xl mb-14 max-w-2xl mx-auto leading-relaxed"
        >
          Discover AI agents by capability. Resolve endpoints in milliseconds.
          Trust scores backed by real data.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mb-8"
        >
          <form onSubmit={handleSubmit}>
            <div
              className={cn(
                'relative max-w-3xl mx-auto rounded-2xl transition-all duration-500',
                searchFocused && 'shadow-[0_0_40px_rgba(6,182,212,0.15),0_0_80px_rgba(139,92,246,0.08)]'
              )}
            >
              <div
                className={cn(
                  'relative flex items-center rounded-2xl border backdrop-blur-xl transition-all duration-300',
                  searchFocused
                    ? 'border-cyan-400/40 bg-[#060918]/80'
                    : 'border-white/[0.1] bg-[#060918]/60'
                )}
              >
                <Search
                  className={cn(
                    'absolute left-6 w-5 h-5 transition-colors duration-300',
                    searchFocused ? 'text-cyan-400' : 'text-gray-500'
                  )}
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Find any agent by name or capability..."
                  className="w-full bg-transparent text-white placeholder-gray-500 pl-16 pr-32 py-5 text-lg focus:outline-none"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="absolute right-3 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-xl text-sm font-semibold hover:from-cyan-400 hover:to-violet-400 transition-all duration-300 cursor-pointer"
                >
                  Search
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Quick search pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="flex flex-wrap justify-center gap-2.5 mb-14"
        >
          <span className="text-gray-600 text-sm self-center mr-1">Try:</span>
          {quickSearchItems.map((item) => (
            <Link
              key={item}
              href={`/explore?capability=${item}`}
              className="px-4 py-1.5 rounded-full text-sm text-gray-400 hover:text-cyan-400 border border-white/[0.08] hover:border-cyan-500/30 bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-sm transition-all duration-300 cursor-pointer"
            >
              {item}
            </Link>
          ))}
        </motion.div>

        {/* Agent count */}
        {agentCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="text-center"
          >
            <div className="inline-flex items-baseline gap-3 px-6 py-3 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm">
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                <NumberTicker value={agentCount} />+
              </span>
              <span className="text-sm text-gray-500">registered agents</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
