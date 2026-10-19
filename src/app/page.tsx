'use client'

export const dynamic = 'force-dynamic'

// app/page.tsx
import { FeaturesShowcase } from '@/components/landing/Featuresshowcase'
import { Hero } from '@/components/landing/Hero'
import { PricingSection } from '@/components/landing/PricingSection'
import { UpgradeHero } from '@/components/landing/UpgradeHero'
import { Footer } from '@/components/shared/Footer'
import { LandingHeader } from '@/components/shared/LandingHeader'

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground antialiased">
      {/* Fixed header */}
      <LandingHeader />

      {/* Main content */}
      <main>
        {/* Hero with dashboard showcase */}
        <Hero />

        {/* Sticky scroll features section */}
        <FeaturesShowcase />

        {/* Pricing section */}
        <PricingSection />

        {/* Upgrade CTA banner */}
        <UpgradeHero />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
