'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'James Whitfield',
    role: 'Founder',
    company: 'Axiom Digital Agency',
    initials: 'JW',
    color: 'bg-indigo-600',
    stars: 5,
    quote:
      'BizOptics completely changed how we prospect. We went from spending 15 hours a week manually researching leads to finding 200 qualified prospects in under an hour. The ROI is incredible.',
  },
  {
    name: 'Sarah Chen',
    role: 'CEO',
    company: 'GrowthLab Studios',
    initials: 'SC',
    color: 'bg-purple-600',
    stars: 5,
    quote:
      "The website scoring feature alone saved us from pitching to businesses who already had great sites. Now we only target the ones with real needs. Our close rate went from 12% to 31%.",
  },
  {
    name: 'Marcus Rivera',
    role: 'Head of Sales',
    company: 'Velocity Digital',
    initials: 'MR',
    color: 'bg-blue-600',
    stars: 5,
    quote:
      'The AI agent opportunity scoring is incredibly accurate. We identified a healthcare clinic that needed an appointment bot, pitched it, and closed a $28k deal within two weeks.',
  },
  {
    name: 'Priya Nair',
    role: 'Owner',
    company: 'Prism Web Solutions',
    initials: 'PN',
    color: 'bg-rose-600',
    stars: 5,
    quote:
      "I was skeptical at first, but the recommendations are genuinely actionable. Each one tells me exactly why a business is a good fit and what to say in my first email. Game changer.",
  },
  {
    name: 'Tom Bradfield',
    role: 'Director',
    company: 'Beacon Creative',
    initials: 'TB',
    color: 'bg-amber-600',
    stars: 5,
    quote:
      "The PDF export feature is perfect for our team reviews. We export the top 20 leads each week, assign them to reps, and track follow-ups. It's become our core prospecting workflow.",
  },
  {
    name: 'Elena Kowalski',
    role: 'Co-founder',
    company: 'Nexus Agency',
    initials: 'EK',
    color: 'bg-emerald-600',
    stars: 5,
    quote:
      'We used to charge clients $500 for a website audit that took 4 hours. Now BizOptics does a better version in 30 seconds. We run 50 audits a day and book a demo for every high scorer.',
  },
];

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-medium mb-6">
            ⭐ Loved By Agencies
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            What Our{' '}
            <span className="gradient-text">Customers Say</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Join thousands of agencies already closing more deals with BizOptics.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-slate-900 rounded-2xl border border-slate-700/50 p-6 hover:border-indigo-500/30 transition-colors"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold shrink-0`}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-slate-400 text-xs">
                    {t.role}, {t.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
