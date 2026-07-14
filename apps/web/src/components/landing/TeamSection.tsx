'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Linkedin } from 'lucide-react';

const team = [
  {
    name: 'Alex Morgan',
    role: 'CEO & Co-founder',
    initials: 'AM',
    color: 'bg-indigo-600',
    bio: '10+ years building SaaS products. Former agency owner who felt the pain of manual lead research firsthand.',
    linkedin: 'https://linkedin.com',
  },
  {
    name: 'Jordan Chen',
    role: 'CTO & Co-founder',
    initials: 'JC',
    color: 'bg-purple-600',
    bio: 'Full-stack engineer with expertise in data pipelines and AI. Led engineering at two successful startups.',
    linkedin: 'https://linkedin.com',
  },
  {
    name: 'Maya Patel',
    role: 'Head of AI',
    initials: 'MP',
    color: 'bg-rose-600',
    bio: 'Machine learning engineer specializing in NLP and business intelligence. PhD in Computer Science.',
    linkedin: 'https://linkedin.com',
  },
  {
    name: 'Sam Rivera',
    role: 'Head of Growth',
    initials: 'SR',
    color: 'bg-amber-600',
    bio: 'Growth strategist who has scaled three SaaS products from 0 to $5M ARR. Obsessed with customer success.',
    linkedin: 'https://linkedin.com',
  },
];

export function TeamSection() {
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
            👋 Meet the Team
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Built by People Who <span className="gradient-text">Get It</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Our team combines agency experience, AI expertise, and product excellence to build the tool
            we always wished we had.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group bg-slate-900 rounded-2xl border border-slate-700/50 p-6 text-center hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10"
            >
              <div
                className={`w-20 h-20 rounded-2xl ${member.color} flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
              >
                {member.initials}
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
              <div className="text-indigo-400 text-sm font-medium mb-3">{member.role}</div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{member.bio}</p>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/10 border border-blue-600/20 text-blue-400 text-sm hover:bg-blue-600/20 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
