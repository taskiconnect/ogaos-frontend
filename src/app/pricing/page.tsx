// src/app/pricing/page.tsx
import { LandingHeader } from '@/components/shared/LandingHeader'
import { PricingSection } from '@/components/landing/PricingSection'
import { Footer } from '@/components/shared/Footer'

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