'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, Zap, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Discover',
    description: 'Find agents by capability, protocol, or category. Search the entire agent ecosystem from one place.',
    gradient: 'from-cyan-500 to-cyan-400',
    glowColor: 'rgba(6, 182, 212, 0.15)',
    delay: 0,
  },
  {
    icon: Zap,
    title: 'Resolve',
    description: 'Get agent endpoints, capabilities, and communication preferences in a single API call. Built for machine speed.',
    gradient: 'from-violet-500 to-violet-400',
    glowColor: 'rgba(139, 92, 246, 0.15)',
    delay: 150,
  },
  {
    icon: ShieldCheck,
    title: 'Trust',
    description: 'Trust scores computed from real usage data. Verified agents, lookup analytics, and reputation tracking.',
    gradient: 'from-emerald-500 to-emerald-400',
    glowColor: 'rgba(16, 185, 129, 0.15)',
    delay: 300,
  },
];

export function FeatureCards() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {features.map((feature) => (
        <FeatureCard key={feature.title} {...feature} visible={visible} />
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
  delay,
  visible,
}: (typeof features)[number] & { visible: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="group relative rounded-2xl p-[1px] transition-all duration-500 cursor-pointer"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {/* Hover border glow that follows mouse */}
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
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}>
          <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
        </div>

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
    </div>
  );
}
