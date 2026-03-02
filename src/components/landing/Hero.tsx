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
import { useEffect, useState } from 'react'

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
    y: 0,
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
  const [navbarHeight, setNavbarHeight] = useState(0)

  useEffect(() => {
    // Find the navbar and get its height
    const navbar = document.querySelector('nav')
    if (navbar) {
      setNavbarHeight(navbar.offsetHeight)
    }

    // Handle resize
    const handleResize = () => {
      const navbar = document.querySelector('nav')
      if (navbar) {
        setNavbarHeight(navbar.offsetHeight)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <BackgroundGrid>
      <section className="relative pt-0 pb-0 md:pt-8 overflow-hidden">
        {/* Ambient glows */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        >
          <div className="absolute left-1/2 top-20 -translate-x-1/2 w-screen max-w-7xl h-[80vh] rounded-full bg-primary/5 blur-[150px] opacity-60" />
          <div className="absolute left-1/4 top-1/3 w-[50vw] h-[50vh] rounded-full bg-brand-blue/5 blur-[120px] opacity-30" />
          <div className="absolute right-1/4 top-1/3 w-[50vw] h-[50vh] rounded-full bg-purple-500/5 blur-[120px] opacity-30" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container relative z-10 mx-auto max-w-7xl px-4 text-center"
          style={{ 
            paddingTop: navbarHeight ? `${navbarHeight + 20}px` : '80px',
          }}
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8 inline-flex items-center justify-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-primary/15"
            >
              <Rocket className="h-4 w-4" aria-hidden="true" />
              <span>We're live</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </motion.div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1] mb-6 max-w-5xl mx-auto"
          >
            Your <span className="bg-linear-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">Oga</span> Business OS <br className="hidden sm:block" />
            for every Nigerian SME
          </motion.h1>

          {/* Feature Pills */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-3 mb-8"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-2 rounded-lg bg-linear-to-r from-secondary/50 via-secondary/40 to-secondary/50 px-3 py-1.5 text-sm font-medium text-secondary-foreground border border-border/50 backdrop-blur-sm hover:border-primary/30 hover:bg-secondary/60 transition-all"
              >
                <feature.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>{feature.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-muted-foreground/90 max-w-3xl mx-auto leading-relaxed mb-12 px-4"
          >
            Say goodbye to lost money, forgotten debts, or staff wahala. OgaOS tracks your cash,
            manages customers & staff, sends reminders via WhatsApp, and makes your business look sharp.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 md:gap-6 mb-16 md:mb-20"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                className="min-w-60 h-14 text-lg font-semibold rounded-full bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all relative overflow-hidden group"
              >
                <span className="relative z-10">Get Started – It's free</span>
                <motion.div 
                  className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="min-w-60 h-14 text-lg font-semibold rounded-full border-2 border-border hover:border-primary/50 hover:bg-primary/5 text-foreground transition-all group relative overflow-hidden"
              >
                <span className="relative z-10">See how it works</span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 relative z-10" aria-hidden="true" />
                <motion.div 
                  className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/5 to-primary/0"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust Line */}
          <motion.div
            variants={itemVariants}
            className="mb-16 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            {[
              { icon: ShieldCheck, text: 'No credit card required' },
              { icon: RefreshCcw, text: 'Cancel anytime' },
              { icon: Sparkles, text: '14-day free trial' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="flex items-center gap-2 group cursor-default"
                whileHover={{ y: -2 }}
              >
                <item.icon className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors" aria-hidden="true" />
                <span className="group-hover:text-foreground transition-colors">{item.text}</span>
                {idx < 2 && <div className="hidden sm:block h-4 w-px bg-border/50" aria-hidden="true" />}
              </motion.div>
            ))}
          </motion.div>

          {/* Dashboard Showcase — Upper part visible, lower part completely hidden */}
          <motion.div
            variants={itemVariants}
            className="relative mt-4 px-4 sm:px-0"
          >
            {/* Glow behind dashboard */}
            <div className="pointer-events-none absolute -inset-x-16 -top-20 h-48 bg-linear-to-t from-primary/15 via-primary/10 to-transparent blur-3xl opacity-60 rounded-full" aria-hidden="true" />

            {/* Dashboard wrapper with perspective tilt */}
            <div
              className="relative rounded-t-3xl overflow-hidden"
              style={{
                perspective: '1000px',
                maxHeight: '320px', // Keep the nice height
              }}
            >
              {/* Tilt container */}
              <motion.div
                initial={{ rotateX: 4, scale: 1.01 }}
                animate={{ rotateX: [4, 3.5, 4] }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  repeatType: "reverse",
                  ease: "easeInOut" 
                }}
                style={{
                  transformOrigin: 'top center',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Top border glow */}
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent z-10"
                  aria-hidden="true"
                />

                {/* Edge fades - keep these subtle */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-background via-background/50 to-transparent z-10" aria-hidden="true" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-background via-background/50 to-transparent z-10" aria-hidden="true" />

                {/* ✨ GRADUAL FADE - Upper part visible, then complete fade ✨ */}
                
                {/* Layer 1: Soft fade starts higher but allows upper part to remain visible */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
                  style={{
                    height: '60%',
                    background: 'linear-gradient(to bottom, transparent 0%, transparent 30%, hsl(var(--background) / 0.4) 50%, hsl(var(--background) / 0.8) 70%, hsl(var(--background)) 90%)',
                    pointerEvents: 'none',
                  }}
                  aria-hidden="true"
                />

                {/* Layer 2: Hard cut at the bottom - content completely disappears */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-30"
                  style={{
                    height: '25%',
                    background: 'linear-gradient(to bottom, transparent 0%, hsl(var(--background) / 0.7) 40%, hsl(var(--background)) 80%)',
                    pointerEvents: 'none',
                  }}
                  aria-hidden="true"
                />

                {/* Layer 3: Final mask - ensures complete invisibility at the very bottom */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-40"
                  style={{
                    height: '15%',
                    background: 'hsl(var(--background))',
                    opacity: 0.95,
                    pointerEvents: 'none',
                  }}
                  aria-hidden="true"
                />

                {/* Dashboard content */}
                <div className="relative" style={{ maxHeight: '320px', overflow: 'hidden' }}>
                  <DashboardShowcase />
                </div>
              </motion.div>
            </div>

            {/* Bottom fade that completes the effect */}
            <div className="absolute -bottom-12 left-0 right-0 h-16 bg-linear-to-t from-background via-background to-transparent pointer-events-none z-50" aria-hidden="true" />
          </motion.div>
        </motion.div>

        {/* Final section bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-background via-background/80 to-transparent pointer-events-none z-30" aria-hidden="true" />
      </section>
    </BackgroundGrid>
  )
}