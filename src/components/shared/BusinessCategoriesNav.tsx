// components/shared/BusinessCategoriesNav.tsx
'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingBag, Utensils, Shirt, Smartphone, Stethoscope,
  GraduationCap, Wrench, Car, Home, Scissors,
  Package, Tv, Dumbbell, Landmark, Wheat,
  ChevronLeft, ChevronRight,
} from 'lucide-react'

const CATEGORIES = [
  { label: 'All',             icon: Package,      slug: 'all' },
  { label: 'Provisions',      icon: ShoppingBag,  slug: 'provisions' },
  { label: 'Food & Drinks',   icon: Utensils,     slug: 'food-drinks' },
  { label: 'Fashion',         icon: Shirt,        slug: 'fashion' },
  { label: 'Electronics',     icon: Smartphone,   slug: 'electronics' },
  { label: 'Health',          icon: Stethoscope,  slug: 'health' },
  { label: 'Education',       icon: GraduationCap,slug: 'education' },
  { label: 'Repairs',         icon: Wrench,       slug: 'repairs' },
  { label: 'Automobile',      icon: Car,          slug: 'automobile' },
  { label: 'Real Estate',     icon: Home,         slug: 'real-estate' },
  { label: 'Beauty & Salon',  icon: Scissors,     slug: 'beauty-salon' },
  { label: 'Agriculture',     icon: Wheat,        slug: 'agriculture' },
  { label: 'Electronics Mkt', icon: Tv,           slug: 'electronics-mkt' },
  { label: 'Fitness',         icon: Dumbbell,     slug: 'fitness' },
  { label: 'Finance',         icon: Landmark,     slug: 'finance' },
]

interface BusinessCategoriesNavProps {
  activeSlug?: string
  onChange?: (slug: string) => void
}

export function BusinessCategoriesNav({
  activeSlug = 'all',
  onChange,
}: BusinessCategoriesNavProps) {
  const [active, setActive] = useState(activeSlug)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' })
  }

  const handleSelect = (slug: string) => {
    setActive(slug)
    onChange?.(slug)
  }

  return (
    <div
      className="w-full border-b"
      style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}
    >
      <div className="relative max-w-screen-xl mx-auto px-4">
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-full
                     bg-gradient-to-r from-black via-black/80 to-transparent text-gray-400 hover:text-white transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable category strip */}
        <div
          ref={scrollRef}
          className="flex items-center gap-1 overflow-x-auto scroll-smooth py-2 px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isActive = active === cat.slug

            return (
              <button
                key={cat.slug}
                onClick={() => handleSelect(cat.slug)}
                className="relative flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl transition-all group"
              >
                {/* Active pill background */}
                {isActive && (
                  <motion.div
                    layoutId="category-active"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(63,154,245,0.12)', border: '1px solid rgba(63,154,245,0.30)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <div
                  className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-lg transition-all
                    ${isActive
                      ? 'text-brand-blue'
                      : 'text-gray-500 group-hover:text-gray-300'
                    }`}
                  style={isActive ? { background: 'rgba(63,154,245,0.15)' } : { background: 'rgba(255,255,255,0.04)' }}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Label */}
                <span
                  className={`relative z-10 text-[11px] font-medium whitespace-nowrap transition-colors
                    ${isActive ? 'text-brand-blue' : 'text-gray-500 group-hover:text-gray-300'}`}
                >
                  {cat.label}
                </span>

                {/* Active underline dot */}
                {isActive && (
                  <motion.div
                    layoutId="category-dot"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-blue"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-full
                     bg-gradient-to-l from-black via-black/80 to-transparent text-gray-400 hover:text-white transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}