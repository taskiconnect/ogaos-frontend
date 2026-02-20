'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

const benefits = [
  { icon: '', label: 'Time-saving' },
  { icon: '', label: 'Team-ready features' },
  { icon: '', label: 'Easy to start' },
]

export function UpgradeHero() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-linear-to-br from-purple-950 via-indigo-950 to-black">
      {/* Subtle geometric grid – visible on dark bg */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(139, 92, 246, 0.18) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(139, 92, 246, 0.18) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Main content – compact */}
      <div className="relative z-10 container mx-auto px-5 sm:px-6 lg:px-8 text-center">
        {/* Small upgrade badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2.5 rounded-full bg-white/10 backdrop-blur-md px-5 py-2 text-sm font-medium text-white border border-white/20 mb-6 md:mb-8"
        >
          <span className="text-purple-300">•••</span> UPGRADE YOUR BUSINESS
        </motion.div>

        {/* Headline – slightly smaller & tighter */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6 md:mb-8"
        >
          OgaOS powered business management <br className="hidden sm:block" />
          for <span className="text-purple-400">productive</span> SMEs
        </motion.h2>

        {/* CTA – prominent but not oversized */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button
            size="lg"
            className="min-w-65 md:min-w-[320px] h-12 md:h-14 text-base md:text-lg font-semibold rounded-full bg-white text-black hover:bg-gray-100 shadow-2xl shadow-purple-950/40 transition-all hover:scale-105"
          >
            Get Started - It's free
          </Button>
        </motion.div>

        {/* Benefits – compact row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.7 }}
          className="mt-10 md:mt-12 flex flex-col sm:flex-row justify-center items-center gap-6 md:gap-12 text-white/90 text-sm md:text-base"
        >
          {benefits.map((benefit, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-3xl md:text-4xl">{benefit.icon}</span>
              <span className="font-medium">{benefit.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Very short bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-black to-transparent pointer-events-none" />
    </section>
  )
}