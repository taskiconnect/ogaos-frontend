// app/auth/verify-email/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LandingHeader } from '@/components/shared/LandingHeader'
import { Footer } from '@/components/shared/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight, RefreshCw } from 'lucide-react'

type VerifyState = 'verifying' | 'success' | 'expired' | 'invalid'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [state, setState] = useState<VerifyState>('verifying')

  // Simulate verification on mount — replace body with real API call later
  useEffect(() => {
    if (!token) {
      setState('invalid')
      return
    }

    // TODO: call POST /auth/verify-email?token=<token>  (AuthService.VerifyEmail)
    const timer = setTimeout(() => {
      // Mock: tokens starting with 'exp' simulate expired, anything else succeeds
      if (token.startsWith('exp')) {
        setState('expired')
      } else {
        setState('success')
      }
    }, 2200)

    return () => clearTimeout(timer)
  }, [token])

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
          background: 'radial-gradient(ellipse 60% 50% at 50% 55%, rgba(0,43,157,0.10) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-5 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div
            className="rounded-2xl border border-white/10 p-8 md:p-10 text-center"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 0 0 1px rgba(0,43,157,0.08), 0 24px 64px rgba(0,0,0,0.5)',
            }}
          >
            <AnimatePresence mode="wait">

              {/* ── VERIFYING ── */}
              {state === 'verifying' && (
                <motion.div
                  key="verifying"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-5"
                >
                  <div
                    className="flex items-center justify-center w-16 h-16 rounded-2xl"
                    style={{ background: 'rgba(0,43,157,0.12)', border: '1px solid rgba(0,43,157,0.25)' }}
                  >
                    <Loader2 className="w-7 h-7 text-primary animate-spin" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2">Verifying your email</h1>
                    <p className="text-sm text-gray-400">Hang tight, we're confirming your account…</p>
                  </div>
                  {/* Animated progress bar */}
                  <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary))' }}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>
              )}

              {/* ── SUCCESS ── */}
              {state === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center gap-6"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                    className="flex items-center justify-center w-16 h-16 rounded-2xl"
                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.30)' }}
                  >
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </motion.div>

                  <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2">Email verified!</h1>
                    <p className="text-sm text-gray-400">
                      Your account is now active. You're ready to manage your business like an Oga.
                    </p>
                  </div>

                  <div className="w-full space-y-3">
                    <Link href="/auth/login" className="block">
                      <Button
                        className="w-full h-11 font-semibold rounded-lg text-white transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 100%)' }}
                      >
                        Sign In to your account
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* ── EXPIRED ── */}
              {state === 'expired' && (
                <motion.div
                  key="expired"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center gap-6"
                >
                  <div
                    className="flex items-center justify-center w-16 h-16 rounded-2xl"
                    style={{ background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.28)' }}
                  >
                    <Mail className="w-7 h-7 text-yellow-400" />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2">Link expired</h1>
                    <p className="text-sm text-gray-400">
                      This verification link has expired. Verification links are valid for{' '}
                      <span className="text-white font-medium">48 hours</span>. Request a new one below.
                    </p>
                  </div>

                  <div className="w-full space-y-3">
                    <Button
                      className="w-full h-11 font-semibold rounded-lg text-white transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 100%)' }}
                      // TODO: call resend verification endpoint
                    >
                      <RefreshCw className="mr-2 w-4 h-4" />
                      Resend verification email
                    </Button>
                    <Link href="/auth/login" className="block">
                      <Button
                        variant="outline"
                        className="w-full h-11 border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all"
                      >
                        Back to Sign In
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* ── INVALID (no token) ── */}
              {state === 'invalid' && (
                <motion.div
                  key="invalid"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center gap-6"
                >
                  <div
                    className="flex items-center justify-center w-16 h-16 rounded-2xl"
                    style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.28)' }}
                  >
                    <XCircle className="w-7 h-7 text-red-400" />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2">Invalid link</h1>
                    <p className="text-sm text-gray-400">
                      This verification link is invalid or has already been used. If you've already
                      verified your email, you can sign in directly.
                    </p>
                  </div>

                  <div className="w-full space-y-3">
                    <Link href="/auth/login" className="block">
                      <Button
                        className="w-full h-11 font-semibold rounded-lg text-white transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 100%)' }}
                      >
                        Go to Sign In
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href="/auth/sign-up" className="block">
                      <Button
                        variant="outline"
                        className="w-full h-11 border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all"
                      >
                        Create a new account
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Help text */}
          <p className="text-center text-xs text-gray-600 mt-5">
            Having trouble?{' '}
            <Link href="/support" className="text-gray-400 hover:text-white transition-colors">
              Contact support
            </Link>
          </p>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}