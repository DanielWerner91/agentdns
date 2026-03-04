'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  agentCount: number;
}

// Star particles positioned across the hero — inspired by FoxyHero from 21st.dev
const starParticles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${5 + (i * 5.3) % 90}%`,
  top: `${8 + (i * 7.1) % 80}%`,
  size: 1.5 + (i % 3) * 0.5,
  isCyan: i % 3 !== 0,
}));

export function HeroSection({ agentCount }: HeroSectionProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Animated light beams — adapted from FoxyHero 21st.dev pattern */}
      <div className="absolute" style={{ width: '452px', height: '477px', right: '-80px', top: '-160px' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`beam-${i}`}
            className="absolute"
            style={{
              width: '180px',
              height: '320px',
              left: `${40 + i * 80}px`,
              top: `${40 + i * 18}px`,
              background: 'linear-gradient(180deg, #06b6d4 0%, rgba(6, 182, 212, 0) 100%)',
              mixBlendMode: 'plus-lighter',
              filter: 'blur(12px)',
              transform: `rotate(${10 + i * 3}deg)`,
            }}
            animate={{ opacity: [0.15 + i * 0.08, 0.4 + i * 0.1, 0.15 + i * 0.08] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
          />
        ))}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '265px',
            height: '400px',
            left: 0,
            top: 0,
            background: 'rgba(6, 182, 212, 0.3)',
            filter: 'blur(125px)',
            transform: 'rotate(37deg)',
          }}
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Left violet glow beams */}
      <div className="absolute" style={{ width: '350px', height: '400px', left: '-60px', top: '-100px' }}>
        {[0, 1].map((i) => (
          <motion.div
            key={`vbeam-${i}`}
            className="absolute"
            style={{
              width: '150px',
              height: '280px',
              left: `${20 + i * 70}px`,
              top: `${30 + i * 20}px`,
              background: 'linear-gradient(180deg, #8b5cf6 0%, rgba(139, 92, 246, 0) 100%)',
              mixBlendMode: 'plus-lighter',
              filter: 'blur(14px)',
              transform: `rotate(-${8 + i * 5}deg)`,
            }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: i * 1 }}
          />
        ))}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '200px',
            height: '300px',
            left: 0,
            top: 0,
            background: 'rgba(139, 92, 246, 0.25)',
            filter: 'blur(100px)',
          }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Ambient glow — large center */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '1100px',
          height: '900px',
          left: '50%',
          top: '10%',
          transform: 'translateX(-50%)',
          background: 'rgba(6, 182, 212, 0.04)',
          filter: 'blur(200px)',
        }}
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Perspective grid */}
      <div className="absolute inset-0 overflow-hidden" style={{ perspective: '500px' }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(6, 182, 212, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.06) 1px, transparent 1px)',
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

      {/* Star particles — from FoxyHero 21st.dev pattern */}
      {starParticles.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute rounded-full"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: star.left,
            top: star.top,
            background: star.isCyan
              ? 'linear-gradient(180deg, #06b6d4 0%, rgba(6, 182, 212, 0) 100%)'
              : 'linear-gradient(180deg, #8b5cf6 0%, rgba(139, 92, 246, 0) 100%)',
            boxShadow: star.isCyan
              ? '0 0 6px rgba(6, 182, 212, 0.8)'
              : '0 0 6px rgba(139, 92, 246, 0.8)',
          }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [1, 2.5, 1] }}
          transition={{
            duration: 2 + (star.id % 5) * 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: (star.id % 7) * 0.4,
          }}
        />
      ))}

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#060918] to-transparent z-[1]" />

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm text-xs text-gray-400 mb-8 group cursor-pointer hover:border-cyan-500/30 transition-colors duration-300"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          The open registry for AI agents
          <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform duration-300" />
        </motion.div>

        {/* Headline — gradient text with staggered entrance */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.08]"
        >
          <span
            className="inline-block"
            style={{
              background: 'linear-gradient(180deg, #f1f5f9 0%, rgba(241,245,249,0.6) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
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
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed"
        >
          Discover AI agents by capability. Resolve endpoints in milliseconds.
          Trust scores backed by real data.
        </motion.p>

        {/* Agent count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {agentCount > 0 ? (
            <p className="text-sm text-gray-500 mb-10">
              <span className="text-cyan-400 font-semibold tabular-nums">{agentCount.toLocaleString()}</span>{' '}
              agents registered and counting
            </p>
          ) : (
            <div className="mb-10" />
          )}
        </motion.div>

        {/* Search bar with glow ring */}
        <motion.form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto mb-6"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <div className="relative group">
            {/* Glow ring */}
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
        </motion.form>

        {/* Quick search pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          {['contract-review', 'code-generation', 'data-analysis', 'image-generation'].map((cap, i) => (
            <motion.div
              key={cap}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 + i * 0.1 }}
            >
              <Link
                href={`/explore?capability=${cap}`}
                className="px-3.5 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-xs text-gray-500 hover:text-cyan-400 hover:border-cyan-500/20 hover:bg-cyan-500/[0.05] transition-all duration-300 cursor-pointer inline-block"
              >
                {cap}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
