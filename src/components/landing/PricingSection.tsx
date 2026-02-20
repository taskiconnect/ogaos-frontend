'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Basic',
    priceMonthly: '₦1,200',
    priceYearly: '₦12,000',
    description: 'Perfect for solo traders & small shops getting started',
    features: [
      'Up to 2 staff accounts',
      'Smart Ledger & basic debt reminders',
      'WhatsApp notifications',
      'Basic professional identity',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Premium',
    priceMonthly: '₦3,500',
    priceYearly: '₦35,000',
    description: 'Best for growing businesses needing full control',
    features: [
      'Unlimited staff accounts',
      'Full debt & credit management',
      'Payments & reconciliation',
      'Staff manager + payroll',
      'Business directory listing',
      'Priority WhatsApp & email support',
    ],
    cta: 'Start Premium',
    popular: true,
  },
  {
    name: 'Enterprise',
    priceMonthly: 'Custom',
    priceYearly: 'Custom',
    description: 'For multi-location businesses & high-volume operations',
    features: [
      'Everything in Premium',
      'Advanced analytics & reports',
      'Custom integrations (POS, accounting)',
      'Dedicated account manager',
      'Hire-Right recruitment module',
      'White-label branding',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

const trustCompanies = [
  { name: 'Taskiconnect', color: '#10b981' },
  { name: 'Realtime', color: '#3b82f6' },
  { name: 'Pellxmart', color: '#ec4899' },
  { name: 'Diademlink', color: '#8b5cf6' },
  { name: 'Taskiglobal', color: '#f59e0b' },
  // duplicated for smooth infinite scroll
  { name: 'Taskiconnect', color: '#10b981' },
  { name: 'Realtime', color: '#3b82f6' },
  { name: 'Pellxmart', color: '#ec4899' },
  { name: 'Diademlink', color: '#8b5cf6' },
  { name: 'Taskiglobal', color: '#f59e0b' },
]

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section className="relative py-20 md:py-32 bg-black overflow-hidden">
      {/* Geometric grid background – visible on black */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Optional subtle radial gradient for depth (very light) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.03) 0%, transparent 70%)',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-block rounded-full bg-white/10 backdrop-blur-md px-6 py-2.5 text-sm font-medium text-white mb-6 border border-white/20">
            PRICING
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
            Simple pricing for <span className="text-primary">productive</span> teams
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choose the plan that fits your business size — from solo traders to growing SMEs.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-12 md:mb-16">
          <div className="inline-flex rounded-full bg-white/10 backdrop-blur-md p-1.5 border border-white/20">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all ${
                !isYearly ? 'bg-white text-black shadow-sm' : 'text-white/70 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all ${
                isYearly ? 'bg-white text-black shadow-sm' : 'text-white/70 hover:text-white'
              }`}
            >
              Yearly <span className="text-green-400 font-semibold">(Save 20%)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`relative rounded-3xl border p-8 lg:p-10 backdrop-blur-xl bg-black/40 border-white/15 shadow-2xl ${
                plan.popular ? 'border-primary/60 shadow-primary/20 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-6 bg-primary text-white text-xs font-semibold px-4 py-1 rounded-full shadow-md">
                  Popular
                </div>
              )}

              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-300 text-sm mb-6 min-h-12.5">{plan.description}</p>

              <div className="mb-8">
                <span className="text-5xl font-extrabold text-white">
                  {isYearly ? plan.priceYearly : plan.priceMonthly}
                </span>
                <span className="text-gray-400 text-lg ml-1">
                  /{isYearly ? 'year' : 'month'}
                </span>
              </div>

              <Button
                className={`w-full rounded-full py-6 text-lg font-semibold ${
                  plan.popular
                    ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
                }`}
              >
                {plan.cta}
              </Button>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-200">
                    <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Trusted by */}
        <div className="mt-20 md:mt-28 text-center">
          <p className="text-lg text-gray-300 mb-10">
            Trusted by leading Nigerian businesses
          </p>

          <div className="overflow-hidden">
            <motion.div
              className="flex gap-12 md:gap-20 whitespace-nowrap"
              animate={{ x: [0, -50 * trustCompanies.length] }}
              transition={{
                duration: 35,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear',
              }}
            >
              {trustCompanies.map((company, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-xl md:text-2xl font-semibold text-white/80 hover:text-white transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                    style={{ backgroundColor: company.color }}
                  >
                    {company.name.charAt(0)}
                  </div>
                  <span>{company.name}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}