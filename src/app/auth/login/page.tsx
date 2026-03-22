'use client'

export const dynamic = 'force-dynamic'

// src/app/auth/login/page.tsx

import { LandingHeader } from '@/components/shared/LandingHeader'
import { Footer } from '@/components/shared/Footer'
import AnimatedLoginWrapper from './AnimatedLoginWrapper'   

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <LandingHeader />

      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,43,157,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,43,157,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(0,43,157,0.09) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-5 pt-28 pb-16">
        <AnimatedLoginWrapper />   {/* ← use the client wrapper */}
      </div>

      <Footer />
    </div>
  )
}