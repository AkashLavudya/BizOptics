'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    monthly: 49,
    annual: 39,
    description: 'Perfect for freelancers and small agencies just starting out.',
    features: [
      '100 businesses/month',
      'Google Places integration',
      'Website + Automation scoring',
      'CSV export',
      'Email support',
      '1 user seat',
    ],
    cta: 'Start Free Trial',
    highlight: false,
    gradient: 'from-slate-700 to-slate-600',
  },
  {
    name: 'Professional',
    monthly: 149,
    annual: 119,
    description: 'Best for growing agencies with active prospecting needs.',
    features: [
      '500 businesses/month',
      'All Starter features',
      'AI Agent scoring',
      'Excel + PDF reports',
      'Priority analysis queue',
      'API access',
      '5 user seats',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlight: true,
    badge: 'Most Popular',
    gradient: 'from-indigo-600 to-purple-600',
  },
  {
    name: 'Enterprise',
    monthly: null,
    annual: null,
    description: 'For large teams needing unlimited scale and white-label solutions.',
    features: [
      'Unlimited businesses',
      'All Professional features',
      'White-label reports',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'Unlimited seats',
      'Custom AI training',
    ],
    cta: 'Contact Sales',
    highlight: false,
    gradient: 'from-slate-700 to-slate-600',
  },
];

export function PricingSection() {
  const [annual, setAnnual] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="pricing" className="py-24 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-6">
            💰 Simple Pricing
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Pricing That <span className="gradient-text">Scales With You</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            Start free. Upgrade when you need more power. Cancel anytime.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-4 bg-slate-800 rounded-xl p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                !annual ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                annual ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">
                20% off
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative rounded-2xl p-0.5 ${plan.highlight ? `bg-gradient-to-br ${plan.gradient}` : 'bg-slate-800/50'}`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-full shadow-lg whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              <div className={`h-full rounded-2xl p-8 flex flex-col ${plan.highlight ? 'bg-slate-900' : 'bg-slate-900/80'}`}>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm">{plan.description}</p>
                </div>

                <div className="mb-8">
                  {plan.monthly ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-white">
                          ${annual ? plan.annual : plan.monthly}
                        </span>
                        <span className="text-slate-400">/mo</span>
                      </div>
                      {annual && (
                        <div className="text-sm text-emerald-400 mt-1">
                          Save ${((plan.monthly! - plan.annual!) * 12).toFixed(0)}/year
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-4xl font-black text-white">Custom</div>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className={`w-4 h-4 shrink-0 ${plan.highlight ? 'text-indigo-400' : 'text-emerald-400'}`} />
                      <span className="text-slate-300">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.monthly ? '/register' : '#contact'}
                  className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-all duration-200 ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02]'
                      : 'border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 hover:bg-white/5'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
