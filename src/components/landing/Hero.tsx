'use client'

import { Button } from '@/components/ui/button'
import { BackgroundGrid } from '@/components/shared/BackgroundGrid'
import { DashboardShowcase } from '@/components/landing/DashboardShowcase'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ShieldCheck,
  RefreshCcw,
  Sparkles,
  Wallet,
  Users,
  MessageCircle,
  TrendingUp,
} from 'lucide-react'
import { useEffect, useState } from 'react'

/* ─── animation variants ─────────────────────────────────────── */
const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
} as const

const item = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
} as const

const slideIn = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 } },
} as const

/* ─── floating stat card ──────────────────────────────────────── */
function FloatCard({
  icon: Icon,
  label,
  value,
  color,
  className,
}: {
  icon: React.ElementType
  label: string
  value: string
  color: string
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
      className={`absolute z-20 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-4 py-3 shadow-xl shadow-black/10 ${className}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div>
        <p className="text-[11px] font-medium text-muted-foreground leading-none mb-0.5">{label}</p>
        <p className="text-sm font-bold text-foreground">{value}</p>
      </div>
    </motion.div>
  )
}

/* ─── hero ────────────────────────────────────────────────────── */
export function Hero() {
  const [navH, setNavH] = useState(80)

  useEffect(() => {
    const sync = () => {
      // target the fixed header element
      const header = document.querySelector('header')
      if (header) setNavH(header.offsetHeight)
    }
    sync()
    // slight delay to ensure header is fully painted
    setTimeout(sync, 100)
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  return (
    <BackgroundGrid>
      <section className="relative overflow-hidden">
        {/* ── ambient glow ── */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute left-0 top-0 w-[55vw] h-[70vh] rounded-full bg-primary/6 blur-[130px] opacity-70" />
          <div className="absolute right-0 bottom-0 w-[40vw] h-[60vh] rounded-full bg-emerald-500/5 blur-[120px] opacity-50" />
        </div>

        <div
          className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          style={{ paddingTop: `${navH + 48}px`, paddingBottom: '0' }}
        >
          {/* ════════════ TWO-COLUMN HERO ════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-20 items-center min-h-[calc(100vh-120px)]">

            {/* ── LEFT: Copy ── */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="visible"
              className="flex flex-col justify-center pb-12 lg:pb-24"
            >
              {/* Badge */}
              <motion.div variants={item} className="mb-7">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-sm font-semibold text-primary">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  Now live in Nigeria
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={item}
                className="text-[2.75rem] sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-extrabold tracking-tight leading-[1.08] text-foreground mb-6"
              >
                Run your business <br className="hidden sm:block" />
                like a{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-linear-to-r from-primary via-primary/85 to-emerald-500 bg-clip-text text-transparent">
                    proper Oga
                  </span>
                  {/* underline squiggle */}
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 200 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <path
                      d="M2 6 Q50 2 100 5 Q150 8 198 4"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.5"
                    />
                  </svg>
                </span>
              </motion.h1>

              {/* Sub */}
              <motion.p
                variants={item}
                className="text-lg sm:text-xl text-muted-foreground/90 leading-relaxed max-w-lg mb-8"
              >
                Track cash, manage staff, chase debtors & send WhatsApp reminders — all in one
                platform built for Nigerian SMEs.
              </motion.p>

              {/* Feature pills */}
              <motion.div variants={item} className="flex flex-wrap gap-2.5 mb-10">
                {[
                  { icon: Wallet, label: 'Cash Tracking' },
                  { icon: Users, label: 'Staff Management' },
                  { icon: MessageCircle, label: 'WhatsApp Alerts' },
                  { icon: TrendingUp, label: 'Sales Reports' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-secondary/60 px-3 py-1.5 text-xs font-semibold text-secondary-foreground"
                  >
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    {label}
                  </div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 mb-10">
                <Button
                  size="lg"
                  className="h-13 px-8 text-base font-semibold rounded-full bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all"
                >
                  Get started — it's free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 px-8 text-base font-semibold rounded-full border-2 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                  See how it works
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </motion.div>

              {/* Trust row */}
              <motion.div variants={item} className="flex flex-wrap gap-5 text-sm text-muted-foreground">
                {[
                  { icon: ShieldCheck, text: 'No credit card required' },
                  { icon: RefreshCcw, text: 'Cancel anytime' },
                  { icon: Sparkles, text: '14-day free trial' },
                ].map(({ icon: Icon, text }, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-primary/70" />
                    {text}
                  </span>
                ))}
              </motion.div>

            </motion.div>

            {/* ── RIGHT: Image + floating cards ── */}
            <motion.div
              variants={slideIn}
              initial="hidden"
              animate="visible"
              className="relative flex items-end justify-center lg:justify-end"
            >
              <div className="relative w-full">

                {/* Glow behind image */}
                <div
                  className="pointer-events-none absolute -inset-8 -z-10 rounded-3xl"
                  style={{
                    background:
                      'radial-gradient(ellipse at 60% 40%, hsl(var(--primary)/0.18) 0%, transparent 70%)',
                  }}
                  aria-hidden
                />

                {/* ── Hero image — bottom tucks under the dashboard ── */}
                <img
                  src="https://ik.imagekit.io/jwrqb9lqx/TaskiConnect%20Website/herooga?updatedAt=1773584899994"
                  alt="Business owner using OgaOS dashboard"
                  className="w-full h-auto object-contain object-bottom relative z-0"
                  style={{
                    maxHeight: '680px',
                    marginBottom: '-140px',
                    filter: 'drop-shadow(0 32px 64px hsl(var(--primary)/0.12))',
                  }}
                />

                {/* ── Floating stat cards — hidden on small mobile, shown sm+ ── */}
                <FloatCard
                  icon={TrendingUp}
                  label="Today's Revenue"
                  value="₦142,800"
                  color="bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                  className="hidden sm:flex -left-8 top-16 lg:-left-12"
                />

                <FloatCard
                  icon={Users}
                  label="Active Customers"
                  value="287 this week"
                  color="bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                  className="hidden sm:flex -right-4 top-1/3 lg:-right-6"
                />

                <FloatCard
                  icon={MessageCircle}
                  label="WhatsApp Alerts"
                  value="Sent to 12 customers"
                  color="bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400"
                  className="hidden sm:flex -left-6 bottom-40 lg:-left-10"
                />
              </div>
            </motion.div>
          </div>

          {/* ════════════ DASHBOARD SHOWCASE (below fold) ════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative mt-4 pb-0 z-20"
          >
            {/* Glow */}
            <div className="pointer-events-none absolute -inset-x-16 -top-12 h-40 bg-linear-to-t from-primary/12 via-primary/6 to-transparent blur-3xl opacity-70 rounded-full" aria-hidden />

            <div
              className="relative rounded-t-3xl overflow-hidden"
              style={{ perspective: '1000px', maxHeight: '340px' }}
            >
              <motion.div
                initial={{ rotateX: 4, scale: 1.01 }}
                animate={{ rotateX: [4, 3.5, 4] }}
                transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                style={{ transformOrigin: 'top center', transformStyle: 'preserve-3d' }}
              >
                {/* Top border glow */}
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent z-10"
                  aria-hidden
                />
                {/* Edge fades */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-background via-background/50 to-transparent z-10" aria-hidden />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-background via-background/50 to-transparent z-10" aria-hidden />
                {/* Fade out layers */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
                  style={{ height: '60%', background: 'linear-gradient(to bottom, transparent 0%, transparent 30%, hsl(var(--background)/0.4) 50%, hsl(var(--background)/0.8) 70%, hsl(var(--background)) 90%)' }}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-30"
                  style={{ height: '25%', background: 'linear-gradient(to bottom, transparent 0%, hsl(var(--background)/0.7) 40%, hsl(var(--background)) 80%)' }}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-40"
                  style={{ height: '15%', background: 'hsl(var(--background))', opacity: 0.95 }}
                  aria-hidden
                />
                <div style={{ maxHeight: '340px', overflow: 'hidden' }}>
                  <DashboardShowcase />
                </div>
              </motion.div>
            </div>

            <div className="absolute -bottom-12 left-0 right-0 h-16 bg-linear-to-t from-background via-background to-transparent pointer-events-none z-50" aria-hidden />
          </motion.div>
        </div>

        {/* Final section fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-background via-background/80 to-transparent pointer-events-none z-30" aria-hidden />
      </section>
    </BackgroundGrid>
  )
}