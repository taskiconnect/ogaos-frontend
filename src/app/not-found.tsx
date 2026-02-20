// src/app/not-found.tsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, Home, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { LandingHeader } from '@/components/shared/LandingHeader'
import { Footer } from '@/components/shared/Footer'

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Navbar */}
      <LandingHeader />

      {/* Geometric grid – same as PricingSection */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(63, 154, 245, 0.10) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(63, 154, 245, 0.10) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Main 404 content */}
      <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-16 md:py-24">
        <div className="max-w-4xl w-full text-center space-y-10 md:space-y-12">
          {/* Large faded 404 */}
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[min(40vw,380px)] font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-gray-700 to-black select-none leading-none"
          >
            404
          </motion.h1>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="space-y-5 md:space-y-6"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
              Page Not Found
            </h2>

            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Oops! The page you're looking for doesn't exist or has been moved.
              Let's get you back to building your business.
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="max-w-lg mx-auto"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search for dashboard, features, pricing..."
                className="w-full bg-gray-900/60 border border-gray-700 rounded-full py-4 px-6 pl-14 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-(--primary)/30 transition shadow-lg"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="flex flex-col sm:flex-row justify-center gap-5 md:gap-8 pt-6"
          >
            <Button
              asChild
              size="lg"
              className="min-w-55 rounded-full bg-primary hover:bg-(--primary)/90 text-white font-medium shadow-lg shadow-(--primary)]/30 transition-all hover:scale-105"
            >
              <Link href="/">
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-w-55 rounded-full border-gray-700 text-white font-medium hover:bg-gray-800 hover:text-white transition-all"
            >
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
          </motion.div>

          {/* Help text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-base text-gray-300 pt-8"
          >
            Lost? <Link href="/contact" className="text-primary hover:underline">Contact support</Link> or{' '}
            <Link href="/faqs" className="text-primary hover:underline">check FAQs</Link>
          </motion.p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}