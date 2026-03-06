'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useMotionTemplate, animate } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import Link from 'next/link';

/* ─── Canvas Particle Field (adapted from 21st.dev SpaceBackground) ─── */
const ParticleField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      hue: number;
    }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const initParticles = () => {
      const count = Math.min(200, Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 5000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        hue: Math.random() > 0.5 ? 186 : 263, // cyan or violet
      }));
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle =
          p.hue === 186
            ? `rgba(6, 182, 212, ${p.opacity})`
            : `rgba(139, 92, 246, ${p.opacity})`;
        ctx.fill();
      }

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    initParticles();
    draw();

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.6 }}
    />
  );
};

/* ─── Word-by-word blur reveal (adapted from 21st.dev Animated Hero) ─── */
const BlurRevealText: React.FC<{
  text: string;
  className?: string;
  delay?: number;
}> = ({ text, className = '', delay = 0 }) => {
  const words = text.split(' ');

  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, filter: 'blur(8px)', y: 10 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{
            duration: 0.5,
            delay: delay + i * 0.12,
            ease: [0.25, 0.4, 0.25, 1],
          }}
        >
          {word}
          {i < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
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

  const glowHue = useMotionValue(186);

  useEffect(() => {
    animate(glowHue, [186, 263, 186], {
      ease: 'easeInOut',
      duration: 8,
      repeat: Infinity,
    });
  }, [glowHue]);

  const borderGlow = useMotionTemplate`hsla(${glowHue}, 80%, 55%, 0.4)`;
  const shadowGlow = useMotionTemplate`0 0 30px hsla(${glowHue}, 80%, 55%, 0.15), 0 0 60px hsla(${glowHue}, 80%, 55%, 0.08)`;

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
    <div className="relative min-h-screen w-full overflow-hidden bg-[#060918] flex items-center justify-center">
      {/* Canvas particle field */}
      <ParticleField />

      {/* Radial gradient overlays */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/[0.07] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-500/[0.07] rounded-full blur-[100px] pointer-events-none" />

      {/* Top edge gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-14"
        >
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="text-sm text-gray-400 font-medium tracking-wide">
              The open registry for AI agents
            </span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-500/60" />
          </div>
        </motion.div>

        {/* Headline — word-by-word blur reveal */}
        <h1 className="text-center text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-8">
          <BlurRevealText
            text="DNS for the"
            className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent"
            delay={0.3}
          />
          <br />
          <BlurRevealText
            text="Agent Economy"
            className="bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"
            delay={0.7}
          />
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center text-gray-500 text-lg md:text-xl mb-14 max-w-2xl mx-auto leading-relaxed"
        >
          Discover AI agents by capability. Resolve endpoints in milliseconds.
          Trust scores backed by real data.
        </motion.p>

        {/* Search Bar — animated border glow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mb-8"
        >
          <form onSubmit={handleSubmit}>
            <motion.div
              className="relative max-w-3xl mx-auto rounded-2xl p-[1px]"
              style={{
                background: searchFocused
                  ? 'linear-gradient(135deg, rgba(6,182,212,0.4), rgba(139,92,246,0.4))'
                  : 'rgba(255,255,255,0.06)',
                boxShadow: searchFocused ? shadowGlow : undefined,
              }}
            >
              <div className="relative flex items-center bg-[#0a0f1e] rounded-2xl">
                <Search
                  className={`absolute left-6 w-5 h-5 transition-colors duration-300 ${
                    searchFocused ? 'text-cyan-400' : 'text-gray-600'
                  }`}
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Find any agent by name or capability..."
                  className="w-full bg-transparent text-white placeholder-gray-600 pl-16 pr-32 py-5 text-lg focus:outline-none"
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
            </motion.div>
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
          {quickSearchItems.map((item, i) => (
            <Link
              key={item}
              href={`/explore?capability=${item}`}
              className="px-4 py-1.5 rounded-full text-sm text-gray-500 hover:text-cyan-400 border border-white/[0.06] hover:border-cyan-500/30 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 cursor-pointer"
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
            <div className="inline-flex items-baseline gap-3 px-6 py-3 rounded-full border border-white/[0.06] bg-white/[0.02]">
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                {agentCount.toLocaleString()}+
              </span>
              <span className="text-sm text-gray-500">registered agents</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
