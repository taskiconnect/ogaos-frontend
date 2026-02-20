// app/page.tsx
import { LandingHeader } from '@/components/shared/LandingHeader'
import { Hero } from '@/components/landing/Hero'
import { UpgradeHero } from '@/components/landing/UpgradeHero' // ← New component
import { PricingSection } from '@/components/landing/PricingSection'
import { Footer } from '@/components/shared/Footer'

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground antialiased">
      {/* Fixed header */}
      <LandingHeader />

      {/* Main content */}
      <main>
        {/* Hero with dashboard showcase */}
        <Hero />

        {/* Pricing section */}
        <PricingSection />

        {/* New Upgrade section – bold purple CTA banner */}
        <UpgradeHero />

        {/* You can add more sections here later */}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}