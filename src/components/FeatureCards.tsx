'use client';

import { useRef } from 'react';
import { Search, Zap, ShieldCheck } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

const features = [
  {
    icon: Search,
    title: 'Discover',
    description: 'Find agents by capability, protocol, or category. Search the entire agent ecosystem from one place.',
    gradient: 'from-cyan-500 to-cyan-400',
    glowColor: 'rgba(6, 182, 212, 0.15)',
    borderGlow: 'rgba(6, 182, 212, 0.4)',
  },
  {
    icon: Zap,
    title: 'Resolve',
    description: 'Get agent endpoints, capabilities, and communication preferences in a single API call. Built for machine speed.',
    gradient: 'from-violet-500 to-violet-400',
    glowColor: 'rgba(139, 92, 246, 0.15)',
    borderGlow: 'rgba(139, 92, 246, 0.4)',
  },
  {
    icon: ShieldCheck,
    title: 'Trust',
    description: 'Trust scores computed from real usage data. Verified agents, lookup analytics, and reputation tracking.',
    gradient: 'from-emerald-500 to-emerald-400',
    glowColor: 'rgba(16, 185, 129, 0.15)',
    borderGlow: 'rgba(16, 185, 129, 0.4)',
  },
];

export function FeatureCards() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {features.map((feature, i) => (
        <FeatureCard key={feature.title} {...feature} index={i} isInView={isInView} />
      ))}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  glowColor,
  index,
  isInView,
}: (typeof features)[number] & { index: number; isInView: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="group relative rounded-2xl p-[1px] cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
    >
      {/* Hover glow that follows mouse */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glowColor}, transparent 40%)`,
        }}
      />

      {/* Card border */}
      <div className="absolute inset-0 rounded-2xl border border-white/[0.06] group-hover:border-white/[0.12] transition-colors duration-500" />

      {/* Card content */}
      <div className="relative bg-white/[0.02] backdrop-blur-sm rounded-2xl p-7 h-full">
        {/* Icon */}
        <motion.div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-10 flex items-center justify-center mb-5`}
          whileHover={{ scale: 1.12, rotate: 3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
        </motion.div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
          {description}
        </p>

        {/* Bottom accent line */}
        <div className="mt-5 h-[1px] w-0 group-hover:w-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700" />
      </div>
    </motion.div>
  );
}
