'use client'

import { motion } from 'framer-motion'
import { Mail, ArrowRight, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { resendVerification } from '@/lib/api/auth'
import { toast } from 'sonner'

export default function VerifyEmailCard() {
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  // Email may have been passed via query param from the signup form for convenience
  // e.g. router.push(`/auth/signupsuccess?email=${encodeURIComponent(email)}`)
  // We read it here if available, but the feature works without it too.
  const email =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('email') ?? ''
      : ''

  const handleResend = async () => {
    if (!email) {
      toast.error('Email address not available. Please go back and sign up again.')
      return
    }
    setResending(true)
    try {
      await resendVerification({ email })
      setResent(true)
      toast.success('Verification email resent! Check your inbox.')
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } }; message?: string }
      toast.error(
        anyErr?.response?.data?.message ||
        anyErr?.message ||
        'Failed to resend. Please try again.'
      )
    } finally {
      setResending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-xl"
    >
      <div
        className="rounded-2xl border border-white/10 p-8 md:p-10 text-center"
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 0 0 1px rgba(0,43,157,0.08), 0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
          <Mail className="h-8 w-8 text-emerald-400" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-3">Check your email</h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          We just sent a verification link{email ? <> to <span className="text-white font-medium">{email}</span></> : ' to your email address'}.
          <br />
          Click the link inside to activate your OgaOS account.
          <br />
        </p>

        <Link href="/auth/login">
          <Button className="w-full h-11 font-semibold">
            I&apos;ve verified — Go to Login
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-gray-500">
          <span>Didn&apos;t receive it?</span>
          {email ? (
            <button
              onClick={handleResend}
              disabled={resending || resent}
              className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
              {resent ? 'Email sent!' : resending ? 'Sending…' : 'Resend email'}
            </button>
          ) : (
            <span>Contact <a href="mailto:support@ogaos.com" className="text-primary hover:underline">support@ogaos.com</a></span>
          )}
        </div>
      </div>
    </motion.div>
  )
}