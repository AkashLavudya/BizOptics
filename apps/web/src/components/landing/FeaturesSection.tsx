'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  MapPin, Globe, Cpu, Bot, Lightbulb, Download,
} from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'Google Places Integration',
    description: 'Search and import business data from Google Places API in real time. Find any local business category in any location.',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10 border-blue-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: Globe,
    title: 'Website Analysis Engine',
    description: 'Automatically checks if a business has a website, HTTPS, contact pages, booking forms, mobile optimization, and analytics.',
    color: 'from-indigo-500 to-purple-500',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
    iconColor: 'text-indigo-400',
  },
  {
    icon: Cpu,
    title: 'Automation Opportunity Scorer',
    description: 'Identifies which businesses have manual workflows that can be automated — appointment booking, invoicing, lead management, and more.',
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-500/10 border-violet-500/20',
    iconColor: 'text-violet-400',
  },
  {
    icon: Bot,
    title: 'AI Agent Suitability',
    description: 'Determines if a business would benefit from an AI customer service agent, FAQ bot, appointment scheduler, or lead qualifier.',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-500/10 border-purple-500/20',
    iconColor: 'text-purple-400',
  },
  {
    icon: Lightbulb,
    title: 'Smart Recommendations',
    description: 'AI-generated action plans for each opportunity — including estimated value, reasons, and step-by-step next actions.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/10 border-amber-500/20',
    iconColor: 'text-amber-400',
  },
  {
    icon: Download,
    title: 'Export & Reports',
    description: 'Export your scored leads as CSV, Excel, or PDF reports — ready to share with your team or use as proposal attachments.',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
      className={`group relative p-6 rounded-2xl border ${feature.bg} backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 hover:shadow-xl`}
    >
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 mb-5 shadow-lg`}
      >
        <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center">
          <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>

      {/* Hover gradient overlay */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
      />
    </motion.div>
  );
}

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
            ⚡ Powerful Features
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Everything You Need to{' '}
            <span className="gradient-text">Find Perfect Clients</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            A complete intelligence stack that turns raw business data into ranked, actionable
            opportunities — automatically.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
