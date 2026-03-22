'use client'

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { LandingHeader } from '@/components/shared/LandingHeader'
import { Footer } from '@/components/shared/Footer'
import { Loader2 } from 'lucide-react'
import VerifyEmailContent from './VerifyEmailContent'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen bg-black text-white">
        <LandingHeader />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[4rem_4rem]" />
        
        <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-5">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
            <p className="mt-4 text-gray-400">Loading verification...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}