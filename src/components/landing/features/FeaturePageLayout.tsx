'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { LandingHeader } from '@/components/shared/LandingHeader'
import { Footer } from '@/components/shared/Footer'
import { Button } from '@/components/ui/button'

export interface FeaturePageProps {
  tag: string
  title: string
  subtitle: string
  description: string
  accent: string
  image: string
  icon: React.ElementType
  benefits: string[]
  howItWorks: { step: number; title: string; body: string }[]
  mockup: React.ReactNode
  nextFeature: { label: string; href: string }
  prevFeature: { label: string; href: string }
}

// Use proper easing values from Framer Motion
const easing = [0.22, 1, 0.36, 1] as const

const item = {
  hidden: { opacity: 0, y: 22 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.7, 
      ease: easing // Use the const assertion
    } 
  },
}

const container = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.1, 
      delayChildren: 0.1 
    } 
  },
}

export function FeaturePageLayout({
  tag, title, subtitle, description, accent, image, icon: Icon,
  benefits, howItWorks, mockup, nextFeature, prevFeature,
}: FeaturePageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <LandingHeader />

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Full-bleed background image */}
        <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover object-center" aria-hidden />
        <div className="absolute inset-0 bg-linear-to-r from-black/92 via-black/70 to-black/35" />
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-black/70" />
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: `radial-gradient(ellipse at 15% 50%, ${accent}50, transparent 60%)` }}
        />

        <div className="relative z-10 container mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 pt-28 pb-20">
          {/* Back link */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Link
              href="/#features"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-10 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to features
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <motion.div variants={container} initial="hidden" animate="visible">
              <motion.div variants={item} className="mb-6 inline-flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${accent}25` }}>
                  <Icon className="w-4 h-4" style={{ color: accent }} />
                </div>
                <span className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: accent }}>{tag}</span>
              </motion.div>

              <motion.h1
                variants={item}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-[1.06] mb-5 whitespace-pre-line"
              >
                {title}
              </motion.h1>

              <motion.p variants={item} className="text-lg lg:text-xl text-white/55 leading-relaxed mb-4 max-w-lg">
                {subtitle}
              </motion.p>

              <motion.p variants={item} className="text-base text-white/40 leading-relaxed mb-10 max-w-md">
                {description}
              </motion.p>

              <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="h-13 px-8 text-base font-semibold rounded-full text-white shadow-lg transition-all"
                  style={{ background: `linear-gradient(135deg, ${accent}cc, ${accent})` }}
                >
                  Get started — it's free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 px-8 text-base font-semibold rounded-full border-white/20 text-white hover:bg-white/10 transition-all"
                >
                  See a demo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Right: mockup */}
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: easing, delay: 0.2 }} // Use the const assertion
              className="flex justify-center lg:justify-end relative"
            >
              <div
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-24 rounded-full blur-3xl opacity-25"
                style={{ background: accent }}
                aria-hidden
              />
              {mockup}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto max-w-5xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground mb-3">
              Why it works for{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}
              >
                Nigerian SMEs
              </span>
            </h2>
            <p className="text-muted-foreground/80 text-lg max-w-xl mx-auto">
              Built around how business actually happens here — cash, credit, WhatsApp, and hustle.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: i * 0.07 }}
                className="flex items-start gap-3 p-5 rounded-2xl border border-border/60 bg-card"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: accent }} />
                <p className="text-sm font-medium text-foreground leading-relaxed">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="container mx-auto max-w-4xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground mb-3">
              How it works
            </h2>
            <p className="text-muted-foreground/80 text-lg">Three steps. No wahala.</p>
          </motion.div>

          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-6 top-8 bottom-8 w-px bg-border/60 hidden sm:block" aria-hidden />

            <div className="space-y-8">
              {howItWorks.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="flex gap-6 items-start"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-extrabold text-white shrink-0 relative z-10"
                    style={{ background: `linear-gradient(135deg, ${accent}cc, ${accent})` }}
                  >
                    {step.step}
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-lg font-bold text-foreground mb-1">{step.title}</h3>
                    <p className="text-muted-foreground/80 leading-relaxed">{step.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="relative py-24 overflow-hidden">
        <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover object-center opacity-30" aria-hidden />
        <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/80 to-black/90" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative z-10 container mx-auto max-w-2xl px-6 text-center"
        >
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
            Ready to try {tag}?
          </h2>
          <p className="text-white/55 text-lg mb-8">
            Join thousands of Nigerian business owners already using OgaOS. Free to start, no credit card needed.
          </p>
          <Button
            size="lg"
            className="h-14 px-10 text-base font-semibold rounded-full text-white shadow-xl"
            style={{ background: `linear-gradient(135deg, ${accent}cc, ${accent})` }}
          >
            Start for free today
          </Button>
        </motion.div>
      </section>

      {/* ── PREV / NEXT NAVIGATION ── */}
      <div className="bg-background border-t border-border/50 py-8">
        <div className="container mx-auto max-w-5xl px-6 flex items-center justify-between gap-4">
          <Link
            href={prevFeature.href}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>{prevFeature.label}</span>
          </Link>
          <Link href="/" className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            All features
          </Link>
          <Link
            href={nextFeature.href}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span>{nextFeature.label}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}