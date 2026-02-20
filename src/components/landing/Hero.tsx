'use client'

import { Button } from '@/components/ui/button'
import { BackgroundGrid } from '@/components/shared/BackgroundGrid'
import { DashboardShowcase } from '@/components/landing/DashboardShowcase'
import { motion } from 'framer-motion'
import { 
  Rocket, 
  ArrowRight,
  ShieldCheck, 
  RefreshCcw, 
  Sparkles,
  Wallet, 
  Users, 
  MessageCircle 
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
} as const

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y:0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
} as const

const features = [
  { icon: Wallet, label: 'Track Cash' },
  { icon: Users, label: 'Manage Staff' },
  { icon: MessageCircle, label: 'WhatsApp Alerts' },
]

export function Hero() {
  return (
    <BackgroundGrid>
      {/* Increased section padding for breathing room */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
        {/* 
           Changed max-w-4xl to max-w-7xl to accommodate the wider dashboard.
           Text elements below are individually constrained to maintain readability.
        */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container relative z-10 mx-auto max-w-7xl px-4 text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8 inline-flex items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm transition-colors hover:bg-primary/10">
              <Rocket className="h-4 w-4" aria-hidden="true" />
              <span>We're live</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </div>
          </motion.div>

          {/* Headline - Constrained width for readability despite wider parent */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1] mb-6 max-w-5xl mx-auto"
          >
            Your <span className="text-primary">Oga</span> Business OS <br className="hidden sm:block" />
            for every Nigerian SME
          </motion.h1>

          {/* Feature Pills - Replacing headline emojis */}
          <motion.div 
            variants={itemVariants} 
            className="flex flex-wrap items-center justify-center gap-3 mb-8"
          >
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-1.5 text-sm font-medium text-secondary-foreground border border-border/50"
              >
                <feature.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>{feature.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Subheadline - Constrained width */}
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12"
          >
            Say goodbye to lost money, forgotten debts, or staff wahala. OgaOS tracks your cash,
            manages customers & staff, sends reminders via WhatsApp, and makes your business look sharp.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 md:gap-6 mb-16 md:mb-20"
          >
            <Button
              size="lg"
              className="min-w-60 h-14 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started – It's free
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="min-w-60 h-14 text-lg font-semibold rounded-full border-2 border-border hover:border-primary/50 hover:bg-primary/5 text-foreground transition-all group"
            >
              See how it works 
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Button>
          </motion.div>

          {/* Dashboard Showcase - Allowed to expand wider than text */}
          <motion.div
            variants={itemVariants}
            className="mt-8 md:mt-12 px-4 sm:px-0"
          >
            {/* Glow Effect behind dashboard */}
            <div 
              className="absolute -inset-1 bg-linear-to-r from-primary/20 via-brand-blue/20 to-primary/20 rounded-3xl blur-3xl opacity-30 animate-pulse pointer-events-none" 
              aria-hidden="true"
            />
            <div className="relative">
              <DashboardShowcase />
            </div>
          </motion.div>

          {/* Trust Line */}
          <motion.div 
            variants={itemVariants} 
            className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>No credit card required</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-border" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>Cancel anytime</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-border" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>14-day free trial</span>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </BackgroundGrid>
  )
}