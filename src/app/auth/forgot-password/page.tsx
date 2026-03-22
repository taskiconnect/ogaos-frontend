export const dynamic = 'force-dynamic'

// app/auth/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LandingHeader } from '@/components/shared/LandingHeader'
import { Footer } from '@/components/shared/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'

type PageState = 'idle' | 'loading' | 'sent' | 'error'

export default function ForgotPasswordPage() {
  const [email, setEmail]               = useState('')
  const [pageState, setPageState]       = useState<PageState>('idle')
  const [errorMsg, setErrorMsg]         = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isResending, setIsResending]   = useState(false)

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const startCooldown = () => {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isValidEmail) return

    setPageState('loading')
    setErrorMsg('')

    // TODO: POST /auth/forgot-password  { email }
    await new Promise((r) => setTimeout(r, 1600))

    setPageState('sent')
    startCooldown()
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return
    setIsResending(true)

    // TODO: POST /auth/forgot-password  { email }
    await new Promise((r) => setTimeout(r, 1400))

    setIsResending(false)
    startCooldown()
  }

  const isSent = pageState === 'sent'

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
          background:
            'radial-gradient(ellipse 60% 50% at 50% 55%, rgba(0,43,157,0.09) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-5 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <AnimatePresence mode="wait">

            {/* FORM */}
            {!isSent && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.35 }}
              >
                <div
                  className="rounded-2xl border border-white/10 p-8 md:p-10"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 0 0 1px rgba(0,43,157,0.08), 0 24px 64px rgba(0,0,0,0.5)',
                  }}
                >
                  <div className="mb-8 text-center">
                    <div
                      className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                      style={{ background: 'rgba(0,43,157,0.12)', border: '1px solid rgba(0,43,157,0.25)' }}
                    >
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1.5">Forgot password?</h1>
                    <p className="text-sm text-gray-400">
                      Enter the email linked to your OgaOS account and we'll send a reset link.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@business.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            if (pageState === 'error') setPageState('idle')
                          }}
                          required
                          className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all"
                        />
                      </div>
                    </div>

                    {/* Error banner */}
                    <AnimatePresence>
                      {pageState === 'error' && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="flex items-start gap-3 p-4 rounded-xl"
                          style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}
                        >
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <p className="text-sm text-red-300">{errorMsg || 'Something went wrong. Please try again.'}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button
                      type="submit"
                      disabled={!isValidEmail || pageState === 'loading'}
                      className="w-full h-11 font-semibold rounded-lg text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 100%)' }}
                    >
                      {pageState === 'loading' ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                          />
                          Sending reset link…
                        </>
                      ) : (
                        <>
                          Send Reset Link
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>

                    <Link
                      href="/auth/login"
                      className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to Sign In
                    </Link>
                  </form>
                </div>
              </motion.div>
            )}

            {/* SENT CONFIRMATION */}
            {isSent && (
              <motion.div
                key="sent"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.35 }}
              >
                <div
                  className="rounded-2xl border border-white/10 p-8 md:p-10 text-center"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 0 0 1px rgba(0,43,157,0.08), 0 24px 64px rgba(0,0,0,0.5)',
                  }}
                >
                  <div className="flex flex-col items-center gap-6">
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                      className="flex items-center justify-center w-16 h-16 rounded-2xl"
                      style={{ background: 'rgba(0,43,157,0.12)', border: '1px solid rgba(0,43,157,0.28)' }}
                    >
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                    </motion.div>

                    <div>
                      <h1 className="text-2xl font-bold tracking-tight mb-2">Check your inbox</h1>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        We sent a password reset link to{' '}
                        <span className="text-white font-medium">{email}</span>.
                        The link expires in <span className="text-white font-medium">48 hours</span>.
                      </p>
                    </div>

                    <div
                      className="w-full text-left space-y-2 p-4 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Didn't get the email?
                      </p>
                      {[
                        'Check your spam or junk folder',
                        'Make sure you entered the right email',
                        'Wait a minute and try resending',
                      ].map((tip) => (
                        <p key={tip} className="text-xs text-gray-400 flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          {tip}
                        </p>
                      ))}
                    </div>

                    <div className="w-full space-y-3">
                      <Button
                        type="button"
                        onClick={handleResend}
                        disabled={resendCooldown > 0 || isResending}
                        variant="outline"
                        className="w-full h-11 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isResending ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                            />
                            Resending…
                          </>
                        ) : resendCooldown > 0 ? (
                          <>
                            <RefreshCw className="mr-2 w-4 h-4 opacity-50" />
                            Resend in {resendCooldown}s
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 w-4 h-4" />
                            Resend reset link
                          </>
                        )}
                      </Button>

                      <Link href="/auth/login" className="block">
                        <Button
                          className="w-full h-11 font-semibold rounded-lg text-white transition-all hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 100%)' }}
                        >
                          Back to Sign In
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          <p className="text-center text-xs text-gray-600 mt-5">
            Need help?{' '}
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