'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const benefits = [
  'Save 20+ hours per week on lead prospecting',
  'Identify 3× more qualified leads than manual research',
  'Reduce your sales cycle by up to 40%',
  'AI-powered scoring removes all guesswork',
  'White-label ready reports for clients',
  'Works for any service business category',
  'Real-time data from Google Places API',
  'No technical knowledge required',
];

const metrics = [
  { value: '10K+', label: 'Businesses Analyzed' },
  { value: '94%', label: 'Scoring Accuracy' },
  { value: '3×', label: 'Faster Lead Generation' },
  { value: '40%', label: 'Sales Cycle Reduction' },
];

export function BenefitsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
              ✅ Why BizOptics
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Why 5,000+ Agencies{' '}
              <span className="gradient-text">Choose BizOptics</span>
            </h2>
            <p className="text-slate-400 mb-8 text-lg">
              Built by agency owners for agency owners. Every feature is designed to help you close
              more deals with less effort.
            </p>

            <ul className="space-y-4">
              {benefits.map((benefit, i) => (
                <motion.li
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-slate-300">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right — metrics */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 p-8 text-center group hover:from-indigo-600/30 hover:to-purple-600/30 transition-all duration-300"
              >
                <div className="text-5xl font-black text-white mb-2">{m.value}</div>
                <div className="text-slate-400 text-sm">{m.label}</div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}

            {/* Trust badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.8 }}
              className="col-span-2 rounded-2xl bg-slate-900 border border-slate-700/50 p-6 flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-xl bg-indigo-600/20 flex items-center justify-center text-3xl shrink-0">
                🏆
              </div>
              <div>
                <div className="text-white font-semibold">Trusted by Leading Agencies</div>
                <div className="text-slate-400 text-sm mt-1">
                  From solo freelancers to agencies with 50+ employees — BizOptics scales with your
                  business.
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
