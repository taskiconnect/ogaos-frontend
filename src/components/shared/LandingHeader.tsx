// src/components/shared/LandingHeader.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, ChevronDown, BarChart3, CreditCard, Calculator, UserPlus, Users, ShoppingBag, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const featureLinks = [
  { href: '/features/sales',       label: 'Sales Record',       desc: 'Track every cash & POS transaction',    icon: BarChart3,  color: 'text-blue-500',    bg: 'bg-blue-500/10'    },
  { href: '/features/debt',        label: 'Debt Tracking',      desc: 'Chase debtors via WhatsApp',            icon: CreditCard, color: 'text-amber-500',   bg: 'bg-amber-500/10'   },
  { href: '/features/tax',         label: 'Tax Calculation',    desc: 'VAT, WHT & CIT — auto-calculated',      icon: Calculator, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { href: '/features/recruitment', label: 'Recruitment',        desc: 'Post jobs and hire faster',             icon: UserPlus,   color: 'text-purple-500',  bg: 'bg-purple-500/10'  },
  { href: '/features/staff',       label: 'Staff Management',   desc: 'Attendance, roles & salaries',          icon: Users,      color: 'text-rose-500',    bg: 'bg-rose-500/10'    },
  { href: '/features/store',       label: 'Digital Store',      desc: 'Sell courses & products online',        icon: ShoppingBag,color: 'text-teal-500',    bg: 'bg-teal-500/10'    },
  { href: '/features/directory',   label: 'Business Directory', desc: 'Get discovered by nearby customers',    icon: MapPin,     color: 'text-indigo-500',  bg: 'bg-indigo-500/10'  },
]

export function LandingHeader() {
  const [isOpen,         setIsOpen]         = useState(false)
  const [featuresOpen,   setFeaturesOpen]   = useState(false)
  const [mobileFeatures, setMobileFeatures] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFeaturesOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <img
            src="https://ik.imagekit.io/jwrqb9lqx/TaskiConnect%20Website/OgaOS%20logo.png"
            alt="OgaOS"
            className="h-9 w-auto object-contain"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">

          {/* Features dropdown trigger */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setFeaturesOpen(v => !v)}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${featuresOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {featuresOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0,  scale: 1    }}
                  exit={{    opacity: 0, y: 8,  scale: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] as const }}
                  className="absolute top-full left-0 mt-3 w-80 bg-card border border-border/60 rounded-2xl shadow-xl shadow-black/10 overflow-hidden"
                >
                  {/* Dropdown header */}
                  <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Platform features</p>
                  </div>

                  {/* Single-column list */}
                  <div className="p-2">
                    {featureLinks.map(({ href, label, desc, icon: Icon, color, bg }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setFeaturesOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors group"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                          <Icon className={`w-4 h-4 ${color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-none mb-0.5">{label}</p>
                          <p className="text-xs text-muted-foreground truncate">{desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-border/50 bg-muted/20">
                    <p className="text-xs text-muted-foreground">7 powerful tools. One subscription.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Blog
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="hidden sm:inline-flex items-center px-5 h-10 rounded-full text-sm font-medium border border-border/60 text-foreground hover:bg-secondary transition-colors"
          >
            Login
          </Link>

          <Button className="hidden sm:inline-flex rounded-full bg-foreground hover:bg-foreground/90 text-background px-6" asChild>
            <Link href="/auth/signup">Get Started</Link>
          </Button>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1,  y:   0 }}
            exit={{    opacity: 0,  y: -10 }}
            className="md:hidden bg-background border-b border-border max-h-[80vh] overflow-y-auto"
          >
            <div className="container mx-auto px-5 sm:px-6 py-6 flex flex-col gap-1">

              {/* Features accordion */}
              <button
                onClick={() => setMobileFeatures(v => !v)}
                className="flex items-center justify-between w-full py-3 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>Features</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileFeatures ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {mobileFeatures && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{    height: 0,      opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-0.5 pl-2 pb-2">
                      {featureLinks.map(({ href, label, icon: Icon, color, bg }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => { setIsOpen(false); setMobileFeatures(false) }}
                          className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-muted/60 transition-colors"
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                            <Icon className={`w-3.5 h-3.5 ${color}`} />
                          </div>
                          <span className="text-sm font-medium text-foreground">{label}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Link
                href="/pricing"
                className="py-3 text-base font-medium text-muted-foreground hover:text-foreground transition-colors border-t border-border/40"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>

              <Link
                href="/blog"
                className="py-3 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Blog
              </Link>

              <Link
                href="/auth/login"
                className="py-3 text-base font-medium text-muted-foreground hover:text-foreground transition-colors border-t border-border/40"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>

              <Button
                className="mt-3 rounded-full bg-foreground hover:bg-foreground/90 text-background"
                asChild
              >
                <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}