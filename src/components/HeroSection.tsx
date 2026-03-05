'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useMotionTemplate, animate } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import Link from 'next/link';

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Floating Particles — from 21st.dev generated component
const FloatingParticles: React.FC = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-cyan-400/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Grid Background — from 21st.dev generated component
const GridBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(6, 182, 212, 0.1)"
              strokeWidth="1"
            />
          </pattern>
          <linearGradient id="gridGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(6, 182, 212, 0.2)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.2)" />
            <stop offset="100%" stopColor="rgba(6, 182, 212, 0.2)" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <motion.line
          x1="0"
          y1="50%"
          x2="100%"
          y2="50%"
          stroke="url(#gridGradient)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
};

interface HeroSectionProps {
  agentCount: number;
}

export function HeroSection({ agentCount }: HeroSectionProps) {
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const color = useMotionValue('#06b6d4');

  useEffect(() => {
    animate(color, ['#06b6d4', '#8b5cf6', '#06b6d4'], {
      ease: 'easeInOut',
      duration: 8,
      repeat: Infinity,
      repeatType: 'reverse',
    });
  }, [color]);

  const glowColor = useMotionTemplate`0 0 40px ${color}, 0 0 80px ${color}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchValue.trim()) params.set('q', searchValue.trim());
    router.push(`/explore?${params.toString()}`);
  };

  const quickSearchItems = [
    'contract-review',
    'code-generation',
    'data-analysis',
    'image-generation',
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#060918] flex items-center justify-center">
      <GridBackground />
      <FloatingParticles />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-violet-500/5 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20">
        {/* Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20 backdrop-blur-sm">
            <motion.div
              className="w-2 h-2 rounded-full bg-cyan-400"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <span className="text-sm font-medium text-cyan-100">
              The open registry for AI agents
            </span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-7xl lg:text-8xl font-bold text-center mb-8 leading-tight"
        >
          <span className="inline-block bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            DNS for the
          </span>
          <br />
          <span className="inline-block bg-gradient-to-r from-violet-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            Agent Economy
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto"
        >
          Discover AI agents by capability. Resolve endpoints in milliseconds.
          Trust scores backed by real data.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <form onSubmit={handleSubmit}>
            <motion.div
              className="relative max-w-3xl mx-auto rounded-2xl"
              style={{
                boxShadow: searchFocused ? glowColor : undefined,
              }}
            >
              <div
                className={cn(
                  'relative flex items-center bg-white/5 backdrop-blur-md rounded-2xl border transition-all duration-300',
                  searchFocused
                    ? 'border-cyan-400/50 shadow-2xl'
                    : 'border-white/10'
                )}
              >
                <Search
                  className={cn(
                    'absolute left-6 w-6 h-6 transition-colors duration-300',
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
                  className="w-full bg-transparent text-white placeholder-gray-500 px-16 py-6 text-lg focus:outline-none"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-3 px-6 py-3 bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-xl font-semibold hover:from-cyan-400 hover:to-violet-400 transition-all duration-300 cursor-pointer"
                >
                  Search
                </motion.button>
              </div>
            </motion.div>
          </form>
        </motion.div>

        {/* Quick Search Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          <span className="text-gray-500 text-sm self-center">
            Popular searches:
          </span>
          {quickSearchItems.map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
            >
              <Link
                href={`/explore?capability=${item}`}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 rounded-full text-sm text-gray-300 hover:text-cyan-300 transition-all duration-300 backdrop-blur-sm inline-block cursor-pointer"
              >
                {item}
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Agent Count */}
        {agentCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-center"
          >
            <div className="inline-flex flex-col items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-white/10 rounded-2xl backdrop-blur-sm">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                {agentCount.toLocaleString()}+
              </div>
              <div className="text-sm text-gray-400">Registered AI Agents</div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
