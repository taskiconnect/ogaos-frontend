'use client'

import { Button } from '@/components/ui/button'
import { BackgroundGrid } from '@/components/shared/BackgroundGrid'
import { DashboardShowcase } from '@/components/landing/DashboardShowcase'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Wallet,
  Users,
  MessageCircle,
  TrendingUp,
  Search,
  MapPin,
  X,
} from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

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

/* ─── store search bar ────────────────────────────────────────── */
const SUGGESTED_TAGS = ['Electronics', 'Fashion', 'Food & Drinks', 'Pharmacy', 'Groceries', 'Beauty']

function StoreSearchBar() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = () => {
    if (!query.trim()) return
    // Navigate to store directory with query — wire up to your router as needed
    window.location.href = `/stores?q=${encodeURIComponent(query.trim())}`
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
    if (e.key === 'Escape') {
      setQuery('')
      inputRef.current?.blur()
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-lg">
      {/* Label */}
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
        Find stores near you
      </p>

      {/* Search input */}
      <div
        className={`relative flex items-center rounded-2xl border bg-background/80 backdrop-blur-sm transition-all duration-200 shadow-sm ${
          focused
            ? 'border-primary/60 shadow-md shadow-primary/10 ring-2 ring-primary/15'
            : 'border-border/60 hover:border-border'
        }`}
      >
        {/* Location pin */}
        <div className="flex items-center pl-4 pr-2 shrink-0">
          <MapPin className="w-4 h-4 text-primary/70" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Search by type, name, or keyword…"
          className="flex-1 bg-transparent py-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none min-w-0"
        />

        {/* Clear */}
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus() }}
            className="p-1.5 mr-1 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="m-1.5 flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-95 transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Suggested tags */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setQuery(tag)
              window.location.href = `/stores?q=${encodeURIComponent(tag)}`
            }}
            className="rounded-full border border-border/50 bg-secondary/50 px-3 py-1 text-[11px] font-medium text-muted-foreground hover:border-primary/40 hover:bg-primary/8 hover:text-primary transition-all"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── hero ────────────────────────────────────────────────────── */
export function Hero() {
  const [navH, setNavH] = useState(80)

  useEffect(() => {
    const sync = () => {
      const header = document.querySelector('header')
      if (header) setNavH(header.offsetHeight)
    }
    sync()
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
          style={{ paddingTop: `${navH + 24}px`, paddingBottom: '0' }}
        >
          {/* ════════════ TWO-COLUMN HERO ════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-6 xl:gap-20 items-center min-h-[calc(100vh-120px)] lg:min-h-[calc(100vh-120px)]">

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

              {/* ── Store Search Bar ── */}
              <motion.div variants={item} className="mb-8">
                <StoreSearchBar />
              </motion.div>

              {/* Divider */}
              <motion.div variants={item} className="flex items-center gap-3 mb-8">
                <div className="h-px flex-1 bg-border/50" />
                <span className="text-xs text-muted-foreground/60 font-medium">or sign up to manage your own store</span>
                <div className="h-px flex-1 bg-border/50" />
              </motion.div>

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
                  asChild
                >
                  <a href="/auth/signup">Get started — it's free</a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 px-8 text-base font-semibold rounded-full border-2 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                  asChild
                >
                  <a href="/auth/login">
                    Login
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </Button>
              </motion.div>



            </motion.div>

            {/* ── RIGHT: Image + floating cards ── */}
            <motion.div
              variants={slideIn}
              initial="hidden"
              animate="visible"
              className="relative flex items-end justify-center lg:justify-end -mb-2 lg:mb-0"
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

                {/* ── Hero image ── */}
                <img
                  src="https://ik.imagekit.io/jwrqb9lqx/TaskiConnect%20Website/Layer%2002.png"
                  alt="Business owner using OgaOS dashboard"
                  className="w-full h-auto object-contain object-bottom relative z-0 block"
                  style={{
                    maxHeight: '900px',
                    width: '115%',
                    marginLeft: '-7.5%',
                    marginBottom: 'clamp(-200px, -18vw, -160px)',
                    marginTop: '-40px',
                    filter: 'drop-shadow(0 32px 64px hsl(var(--primary)/0.12))',
                  }}
                />

                {/* ── Floating stat cards ── */}
                <FloatCard
                  icon={TrendingUp}
                  label="Today's Revenue"
                  value="₦142,800"
                  color="bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                  className="hidden sm:flex -left-8 top-36 lg:-left-12"
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

          {/* ════════════ DASHBOARD SHOWCASE ════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative mt-0 lg:mt-4 pb-0 z-20"
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