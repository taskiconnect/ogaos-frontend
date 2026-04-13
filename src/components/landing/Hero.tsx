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
  Loader2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
} as const

const item = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
} as const

const SUGGESTED_TAGS = ['Electronics', 'Fashion', 'Food & Drinks', 'Pharmacy', 'Groceries', 'Beauty']

function StoreSearchBar() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const redirectToSearch = (params: URLSearchParams) => {
    window.location.href = `/public/search?${params.toString()}`
  }

  const searchWithLocation = () => {
    setError(null)

    if (!navigator.geolocation) {
      const params = new URLSearchParams()
      if (query.trim()) params.set('q', query.trim())
      redirectToSearch(params)
      return
    }

    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams()
        if (query.trim()) params.set('q', query.trim())
        params.set('lat', String(position.coords.latitude))
        params.set('lng', String(position.coords.longitude))
        params.set('radius_km', '10')
        redirectToSearch(params)
      },
      () => {
        const params = new URLSearchParams()
        if (query.trim()) params.set('q', query.trim())
        params.set('location_denied', '1')
        redirectToSearch(params)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') searchWithLocation()
    if (e.key === 'Escape') {
      setQuery('')
      inputRef.current?.blur()
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/70">
        Find businesses near you
      </p>

      <div className="rounded-3xl border border-border/60 bg-background/85 p-3 shadow-sm backdrop-blur-sm">
        <div
          className={`relative flex items-center rounded-2xl border bg-background transition-all duration-200 ${
            focused
              ? 'border-primary/60 shadow-md shadow-primary/10 ring-2 ring-primary/15'
              : 'border-border/60 hover:border-border'
          }`}
        >
          <div className="flex shrink-0 items-center pl-4 pr-2">
            <Search className="h-4 w-4 text-primary/70" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Search by business name or keyword…"
            className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
          />

          {query && (
            <button
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              className="mr-1 rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-secondary/60 hover:text-foreground"
              aria-label="Clear search"
              type="button"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={searchWithLocation}
            type="button"
            disabled={isLocating}
            className="m-1.5 flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-70"
          >
            {isLocating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isLocating ? 'Searching...' : 'Search nearby'}</span>
          </button>
        </div>

        {error ? (
          <p className="mt-3 text-xs font-medium text-red-500">{error}</p>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground/75">
            We’ll ask for your current location. If you deny permission, we’ll still show matching businesses from all available results.
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTED_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setQuery(tag)

                if (!navigator.geolocation) {
                  const params = new URLSearchParams()
                  params.set('q', tag)
                  redirectToSearch(params)
                  return
                }

                setIsLocating(true)
                setError(null)

                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const params = new URLSearchParams()
                    params.set('q', tag)
                    params.set('lat', String(position.coords.latitude))
                    params.set('lng', String(position.coords.longitude))
                    params.set('radius_km', '10')
                    redirectToSearch(params)
                  },
                  () => {
                    const params = new URLSearchParams()
                    params.set('q', tag)
                    params.set('location_denied', '1')
                    redirectToSearch(params)
                  },
                  {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000,
                  }
                )
              }}
              className="rounded-full border border-border/50 bg-secondary/50 px-3 py-1 text-[11px] font-medium text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/8 hover:text-primary"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

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
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute top-0 left-0 h-[70vh] w-[55vw] rounded-full bg-primary/6 opacity-70 blur-[130px]" />
          <div className="absolute right-0 bottom-0 h-[60vh] w-[40vw] rounded-full bg-emerald-500/5 opacity-50 blur-[120px]" />
        </div>

        <div
          className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          style={{ paddingTop: `${navH + 24}px`, paddingBottom: '0' }}
        >
          <div className="flex min-h-[calc(100vh-120px)] flex-col justify-center">
            <motion.div
              variants={container}
              initial="hidden"
              animate="visible"
              className="mx-auto flex w-full max-w-3xl flex-col items-center text-center pb-12"
            >
              <motion.div variants={item} className="mb-7">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-sm font-semibold text-primary">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  Now live in Nigeria
                </span>
              </motion.div>

              <motion.h1
                variants={item}
                className="mb-6 text-[2.75rem] leading-[1.08] font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] xl:text-[4rem]"
              >
                Run your business{' '}
                like a{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-linear-to-r from-primary via-primary/85 to-emerald-500 bg-clip-text text-transparent">
                    proper Oga
                  </span>
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

              <motion.p
                variants={item}
                className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground/90 sm:text-xl"
              >
                Track cash, manage staff, chase debtors &amp; send WhatsApp reminders — all in one
                platform built for Nigerian SMEs.
              </motion.p>

              <motion.div variants={item} className="mb-8 w-full">
                <StoreSearchBar />
              </motion.div>

              <motion.div variants={item} className="mb-8 flex w-full max-w-xl items-center gap-3">
                <div className="h-px flex-1 bg-border/50" />
                <span className="text-xs font-medium text-muted-foreground/60">
                  or sign up to manage your own store
                </span>
                <div className="h-px flex-1 bg-border/50" />
              </motion.div>

              <motion.div variants={item} className="mb-10 flex flex-wrap justify-center gap-2.5">
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
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    {label}
                  </div>
                ))}
              </motion.div>

              <motion.div variants={item} className="mb-10 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-13 rounded-full bg-linear-to-r from-primary to-primary/80 px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:from-primary/90 hover:to-primary"
                  asChild
                >
                  <a href="/auth/signup">Get started — it's free</a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="group h-13 rounded-full border-2 px-8 text-base font-semibold transition-all hover:border-primary/40 hover:bg-primary/5"
                  asChild
                >
                  <a href="/auth/login">
                    Login
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </Button>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-20 mt-0 pb-0"
          >
            <div
              className="pointer-events-none absolute -inset-x-16 -top-12 h-40 rounded-full bg-linear-to-t from-primary/12 via-primary/6 to-transparent opacity-70 blur-3xl"
              aria-hidden
            />

            <div
              className="relative overflow-hidden rounded-t-3xl"
              style={{ perspective: '1000px', maxHeight: '400px' }}
            >
              <motion.div
                initial={{ rotateX: 4, scale: 1.01 }}
                animate={{ rotateX: [4, 3.5, 4] }}
                transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                style={{ transformOrigin: 'top center', transformStyle: 'preserve-3d' }}
              >
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
                  aria-hidden
                />

                <div
                  className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-background via-background/50 to-transparent"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-background via-background/50 to-transparent"
                  aria-hidden
                />

                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
                  style={{
                    height: '60%',
                    background:
                      'linear-gradient(to bottom, transparent 0%, transparent 30%, hsl(var(--background)/0.4) 50%, hsl(var(--background)/0.8) 70%, hsl(var(--background)) 90%)',
                  }}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-30"
                  style={{
                    height: '25%',
                    background:
                      'linear-gradient(to bottom, transparent 0%, hsl(var(--background)/0.7) 40%, hsl(var(--background)) 80%)',
                  }}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-40"
                  style={{ height: '15%', background: 'hsl(var(--background))', opacity: 0.95 }}
                  aria-hidden
                />

                <div style={{ maxHeight: '400px', overflow: 'hidden' }}>
                  <DashboardShowcase />
                </div>
              </motion.div>
            </div>

            <div
              className="pointer-events-none absolute -bottom-12 left-0 right-0 z-50 h-16 bg-linear-to-t from-background via-background to-transparent"
              aria-hidden
            />
          </motion.div>
        </div>

        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 h-24 bg-linear-to-t from-background via-background/80 to-transparent"
          aria-hidden
        />
      </section>
    </BackgroundGrid>
  )
}