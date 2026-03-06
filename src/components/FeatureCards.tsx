'use client';

import React, { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Search, Zap, Shield } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { GlowEffect } from '@/components/ui/glow-effect';

/* ─── Feature Card with SpotlightCard + GlowEffect ─── */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
  glowColors: string[];
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  accentColor,
  glowColors,
  index,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative group">
        {/* Animated rotating glow behind the card — visible on hover */}
        <div className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
          <GlowEffect
            colors={glowColors}
            mode="rotate"
            blur="soft"
            duration={4}
          />
        </div>

        <SpotlightCard
          spotlightColor={`${accentColor}20`}
          className="h-full"
        >
          <div className="p-8">
            {/* Icon */}
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6"
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
          </div>
        </SpotlightCard>
      </div>
    </motion.div>
  );
};

/* ─── Feature Cards Grid with Aceternity hover background ─── */
export function FeatureCards() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Discover',
      description:
        'Find agents by capability, protocol, or category. Search the entire agent ecosystem from one place.',
      accentColor: '#06b6d4',
      glowColors: ['#06b6d4', 'transparent', '#06b6d4', 'transparent'],
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Resolve',
      description:
        'Get agent endpoints, capabilities, and communication preferences in a single API call. Built for machine speed.',
      accentColor: '#8b5cf6',
      glowColors: ['#8b5cf6', 'transparent', '#8b5cf6', 'transparent'],
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Trust',
      description:
        'Trust scores computed from real usage data. Verified agents, lookup analytics, and reputation tracking.',
      accentColor: '#22c55e',
      glowColors: ['#22c55e', 'transparent', '#22c55e', 'transparent'],
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
          {/* Aceternity layoutId animated hover background */}
          <AnimatePresence>
            {hoveredIndex === index && (
              <motion.div
                className="absolute -inset-3 rounded-3xl bg-white/[0.02]"
                layoutId="featureCardHover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
          </AnimatePresence>

          <FeatureCard {...feature} index={index} />
        </div>
      ))}
    </div>
  );
}
