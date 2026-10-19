'use client'

export const dynamic = 'force-dynamic'

// src/app/pricing/page.tsx
import { PricingSection } from '@/components/landing/PricingSection'
import { Footer } from '@/components/shared/Footer'
import { LandingHeader } from '@/components/shared/LandingHeader'

export default function PricingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground antialiased">
      {/* Navbar */}
      <LandingHeader />

      {/* Pricing section – full-width, same as landing page */}
      <PricingSection />

      {/* Footer */}
      <Footer />
    </div>
  )
}
