'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Search, Zap, Shield } from 'lucide-react';

/* ─── GlowingEffect border (adapted from 21st.dev GlowingEffect) ─── */
/* Animated conic-gradient border that rotates + follows mouse on hover */

interface GlowCardProps {
  children: React.ReactNode;
  accentColor: string;
  className?: string;
}

const GlowCard: React.FC<GlowCardProps> = ({ children, accentColor, className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const rotationRef = useRef(0);
  const animFrameRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  // Continuous rotation for the conic gradient
  useEffect(() => {
    const tick = () => {
      rotationRef.current = (rotationRef.current + 0.4) % 360;
      if (cardRef.current) {
        cardRef.current.style.setProperty('--rotation', `${rotationRef.current}deg`);
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={
        {
          '--mouse-x': mousePos.x,
          '--mouse-y': mousePos.y,
          '--accent': accentColor,
        } as React.CSSProperties
      }
    >
      {/* Animated conic gradient border */}
      <div
        className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `conic-gradient(from var(--rotation, 0deg) at calc(var(--mouse-x, 0.5) * 100%) calc(var(--mouse-y, 0.5) * 100%), ${accentColor}60, transparent 40%, ${accentColor}30, transparent 70%, ${accentColor}60)`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px',
          borderRadius: '1rem',
        }}
      />

      {/* Inner glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at calc(var(--mouse-x, 0.5) * 100%) calc(var(--mouse-y, 0.5) * 100%), ${accentColor}08, transparent 50%)`,
        }}
      />

      {/* Card body */}
      <div className="relative h-full rounded-2xl border border-white/[0.06] bg-[#0a0f1e]/90 backdrop-blur-xl p-8 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

/* ─── Feature Card Content ─── */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  accentColor,
  index,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.25, 0.4, 0.25, 1] }}
    >
      <GlowCard accentColor={accentColor}>
        {/* Icon */}
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-6"
          style={{
            background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}05)`,
            border: `1px solid ${accentColor}20`,
          }}
        >
          <div style={{ color: accentColor }}>{icon}</div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>

        {/* Description */}
        <p className="text-gray-500 leading-relaxed text-[15px]">{description}</p>
      </GlowCard>
    </motion.div>
  );
};

/* ─── Aceternity-style animated hover background ─── */
export function FeatureCards() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Discover',
      description:
        'Find agents by capability, protocol, or category. Search the entire agent ecosystem from one place.',
      accentColor: '#06b6d4',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Resolve',
      description:
        'Get agent endpoints, capabilities, and communication preferences in a single API call. Built for machine speed.',
      accentColor: '#8b5cf6',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Trust',
      description:
        'Trust scores computed from real usage data. Verified agents, lookup analytics, and reputation tracking.',
      accentColor: '#22c55e',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <div
          key={feature.title}
          className="relative"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Aceternity animated hover background */}
          <AnimatePresence>
            {hoveredIndex === index && (
              <motion.div
                className="absolute -inset-2 rounded-3xl bg-white/[0.03]"
                layoutId="cardHover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </AnimatePresence>
          <FeatureCard {...feature} index={index} />
        </div>
      ))}
    </div>
  );
}
