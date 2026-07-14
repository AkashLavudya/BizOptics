'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    q: 'How does BizOptics find businesses?',
    a: 'BizOptics integrates with the Google Places API to search for local businesses by type and location. You simply enter a keyword (e.g., "dental clinics") and a city, and we fetch all matching businesses with their details — address, phone, website, rating, reviews, and more.',
  },
  {
    q: 'What data does the platform analyze?',
    a: 'We analyze three dimensions: (1) Website presence — do they have a site? Is it HTTPS? Does it have contact/booking pages? (2) Automation needs — based on their category and business type, what manual workflows could be automated? (3) AI agent suitability — could they benefit from a chatbot, FAQ bot, or appointment scheduler?',
  },
  {
    q: 'Can I use it without a Google Places API key?',
    a: "Yes! BizOptics works in demo mode without an API key — we provide sample data so you can explore all features. To search real businesses, you'll need a free Google Places API key, which takes about 5 minutes to set up.",
  },
  {
    q: 'How accurate is the scoring system?',
    a: "Our scoring algorithm has been validated against thousands of businesses with 94% accuracy in identifying genuine opportunities. The scores are based on weighted analysis of website quality, business category characteristics, and industry-specific automation patterns.",
  },
  {
    q: 'What export formats are supported?',
    a: 'BizOptics supports three export formats: CSV (spreadsheet-compatible, works with any tool), Excel (.xlsx with formatted tables and color-coding), and PDF (professionally formatted reports ready to share with clients).',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes! Every plan comes with a 14-day free trial — no credit card required. You get full access to all features for your chosen plan tier during the trial period.',
  },
  {
    q: 'How does the website analysis work?',
    a: "When we find a business with a website URL, our analysis engine sends a request to that website and inspects its HTML. We check for HTTPS, contact form keywords, booking/appointment keywords, mobile viewport tags, analytics scripts (Google Analytics, GTM), and social proof elements (reviews, testimonials).",
  },
  {
    q: 'Can I white-label the reports?',
    a: 'White-label reporting is available on the Enterprise plan. This lets you remove all BizOptics branding from PDF reports and replace it with your own agency logo and colors — perfect for delivering to clients as your own analysis.',
  },
];

export function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="faq" className="py-24 bg-slate-900/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
            ❓ FAQ
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-xl text-slate-400">
            Everything you need to know about BizOptics.
          </p>
        </motion.div>

        <Accordion.Root type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.07 }}
            >
              <Accordion.Item
                value={`item-${i}`}
                className="bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden hover:border-indigo-500/30 transition-colors"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium text-white hover:text-indigo-300 transition-colors">
                    {faq.q}
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-4 group-data-[state=open]:rotate-180 transition-transform duration-200" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                  <div className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-slate-700/50 pt-4">
                    {faq.a}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            </motion.div>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
