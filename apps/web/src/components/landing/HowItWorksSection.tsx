'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, BarChart3, Target, Rocket } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Search & Discover',
    description:
      'Enter a business type and location. BizOptics queries Google Places to find relevant local businesses and imports their data automatically.',
    color: 'from-blue-500 to-indigo-500',
    iconColor: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    number: '02',
    icon: BarChart3,
    title: 'Analyze Automatically',
    description:
      'Our three-engine system analyzes each business: Website Engine checks their online presence, Automation Engine identifies workflow gaps, AI Engine assesses chatbot suitability.',
    color: 'from-indigo-500 to-violet-500',
    iconColor: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    number: '03',
    icon: Target,
    title: 'Score & Prioritize',
    description:
      'Our intelligent scoring algorithm combines all three scores (weighted) into a single Final Score with a Priority Level — so you focus on your hottest leads first.',
    color: 'from-violet-500 to-purple-500',
    iconColor: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    number: '04',
    icon: Rocket,
    title: 'Take Action',
    description:
      'Export your top leads as CSV/Excel/PDF, generate client proposals, and close more deals — with AI-generated recommendations as your sales blueprint.',
    color: 'from-purple-500 to-pink-500',
    iconColor: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" className="py-24 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
            🔄 Simple Process
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            How <span className="gradient-text">BizOptics</span> Works
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            From search to closed deal in four simple steps. No manual research required.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 via-violet-500 to-purple-500 opacity-30" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative"
            >
              <div className="text-center">
                {/* Number circle */}
                <div
                  className={`relative mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br ${step.color} p-0.5 mb-6 shadow-lg`}
                >
                  <div className="w-full h-full rounded-[14px] bg-slate-900 flex flex-col items-center justify-center">
                    <step.icon className={`w-7 h-7 ${step.iconColor} mb-1`} />
                    <span className="text-xs font-bold text-slate-500">{step.number}</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
