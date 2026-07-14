'use client';

import Link from 'next/link';
import { ArrowRight, Play, TrendingUp, Users, Zap } from 'lucide-react';

// Static stats — no framer-motion needed here
const stats = [
  { icon: Users, label: 'Businesses Analyzed', value: '10,000+' },
  { icon: TrendingUp, label: 'Accuracy Score', value: '94%' },
  { icon: Zap, label: 'Faster Lead Gen', value: '3×' },
];

const businesses = [
  { name: "Mario's Restaurant", priority: 'CRITICAL', score: 91 },
  { name: 'Sunshine Dental', priority: 'HIGH', score: 78 },
  { name: 'Elite Hair Studio', priority: 'HIGH', score: 74 },
];

const bars = [40, 65, 45, 80, 70, 90, 85, 95, 78, 88, 75, 92];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center hero-gradient overflow-hidden">
      {/* Background orbs — pure CSS animation, no JS needed */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-600/15 rounded-full blur-3xl animate-pulse [animation-delay:4s]" />
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column — SSR-rendered immediately */}
          <div className="animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              🚀 Now with AI-Powered Business Analysis
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6">
              Identify Every{' '}
              <span className="gradient-text">Business</span>
              <br />
              That Needs Your Services
            </h1>

            <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-xl">
              BizOptics automatically discovers local businesses, analyzes their digital maturity, and
              scores opportunities for website development, workflow automation, and AI agents — so you
              always know who to call next.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link
                href="/register"
                className="group flex items-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95 animate-pulse-glow"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="flex items-center gap-2 px-7 py-3.5 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 font-semibold rounded-xl transition-all duration-200 hover:bg-white/5">
                <Play className="w-4 h-4" />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-slate-400">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — dashboard mockup, pure CSS animations */}
          <div className="hidden lg:block animate-fade-in [animation-delay:300ms]">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-600/20 rounded-3xl blur-2xl scale-110" />

              <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex-1 h-6 bg-slate-800 rounded-md flex items-center px-3">
                    <span className="text-xs text-slate-500">bizoptics.com/dashboard</span>
                  </div>
                </div>

                {/* Scores row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Website', score: 82, color: 'text-emerald-400' },
                    { label: 'Automation', score: 91, color: 'text-indigo-400' },
                    { label: 'AI Score', score: 78, color: 'text-purple-400' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-slate-800/80 rounded-xl p-4 text-center border border-slate-700/50"
                    >
                      <div className={`text-2xl font-bold ${s.color}`}>{s.score}</div>
                      <div className="text-xs text-slate-400 mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Business list */}
                <div className="space-y-2">
                  {businesses.map((b) => (
                    <div
                      key={b.name}
                      className="flex items-center justify-between bg-slate-800/60 rounded-lg px-3 py-2.5 border border-slate-700/30"
                    >
                      <div>
                        <div className="text-sm font-medium text-white">{b.name}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full ${
                              b.priority === 'CRITICAL'
                                ? 'bg-red-500/15 text-red-400'
                                : 'bg-orange-500/15 text-orange-400'
                            }`}
                          >
                            {b.priority}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          b.score >= 80 ? 'text-emerald-400' : 'text-orange-400'
                        }`}
                      >
                        {b.score}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart mockup — CSS bar animation */}
                <div className="mt-4 bg-slate-800/60 rounded-xl p-4 border border-slate-700/30">
                  <div className="text-xs text-slate-400 mb-3">Revenue Opportunity</div>
                  <div className="flex items-end gap-1 h-16">
                    {bars.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-sm opacity-80 transition-all duration-500"
                        style={{ height: `${h}%`, animationDelay: `${i * 50}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
