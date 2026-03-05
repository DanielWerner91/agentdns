'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, Zap, Shield } from 'lucide-react';

// 21st.dev generated FeatureCard with mouse-following radial glow
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  accentColor,
  delay,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    if (isHovered) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovered]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      <div
        ref={cardRef}
        className="relative h-full rounded-2xl border border-white/10 bg-[#0a0f1e]/80 backdrop-blur-xl p-8 overflow-hidden group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Mouse-following radial glow */}
        {isHovered && (
          <div
            className="absolute pointer-events-none transition-opacity duration-300"
            style={{
              left: mousePosition.x,
              top: mousePosition.y,
              width: '400px',
              height: '400px',
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
              opacity: 1,
            }}
          />
        )}

        {/* Border glow on hover */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${accentColor}20, transparent)`,
            padding: '1px',
            WebkitMask:
              'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Gradient icon container */}
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`,
              border: `1px solid ${accentColor}40`,
            }}
          >
            <div
              className="absolute inset-0 opacity-50"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${accentColor}40, transparent)`,
              }}
            />
            <div className="relative z-10" style={{ color: accentColor }}>
              {icon}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>

          {/* Description */}
          <p className="text-gray-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

const features = [
  {
    icon: <Search className="w-8 h-8" />,
    title: 'Discover',
    description:
      'Find agents by capability, protocol, or category. Search the entire agent ecosystem from one place.',
    accentColor: '#06b6d4',
    delay: 0.1,
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: 'Resolve',
    description:
      'Get agent endpoints, capabilities, and communication preferences in a single API call. Built for machine speed.',
    accentColor: '#8b5cf6',
    delay: 0.2,
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Trust',
    description:
      'Trust scores computed from real usage data. Verified agents, lookup analytics, and reputation tracking.',
    accentColor: '#22c55e',
    delay: 0.3,
  },
];

export function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <FeatureCard key={index} {...feature} />
      ))}
    </div>
  );
}
