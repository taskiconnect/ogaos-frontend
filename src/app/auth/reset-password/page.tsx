// app/auth/reset-password/page.tsx
//
// Landing page for the emailed reset link:  /auth/reset-password?token=...
// The user arrives here directly and sets a new password. No current password needed.
'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LandingHeader } from '@/components/shared/LandingHeader'
import { Footer } from '@/components/shared/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, Check, X, LinkIcon } from 'lucide-react'
import { resetPassword } from '@/lib/api/auth'
import {
  PASSWORD_RULES,
  RuleItem,
  StrengthBar,
  PasswordInput,
  allRulesPassed,
} from '@/components/auth/password-fields'

type ViewState = 'form' | 'loading' | 'success' | 'invalid-link'

type HttpishError = Error & { status?: number; response?: { data?: { code?: string } } }

const cardStyle = {
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(16px)',
  boxShadow: '0 0 0 1px rgba(0,43,157,0.08), 0 24px 64px rgba(0,0,0,0.5)',
} as const

const primaryBtnStyle = {
  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 100%)',
} as const

/** True when the backend rejected the token itself (as opposed to the password). */
function isTokenProblem(err: unknown): boolean {
  const e = err as HttpishError
  if (e?.response?.data?.code === 'invalid_token') return true
  if (e?.status === 410) return true
  return e?.status === 400 && /token|expired|link/i.test(e.message ?? '')
}

function friendlyError(err: unknown): string {
  const e = err as HttpishError
  if (e?.status === 429) return 'Too many attempts. Please wait a few minutes and try again.'
  if (e?.status && e.status >= 500) return 'Something went wrong on our side. Please try again.'
  if (e instanceof TypeError) return 'Network error. Check your connection and try again.'
  return e?.message || 'Could not reset your password. Please try again.'
}

function ResetPasswordForm() {
  const searchParams = useSearchParams()

  // Capture the token once, then strip it from the address bar so it does not
  // linger in history or leak through the Referer header.
  const [token] = useState(() => searchParams.get('token')?.trim() ?? '')
  useEffect(() => {
    if (token && typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [token])

  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [view, setView] = useState<ViewState>(token ? 'form' : 'invalid-link')
  const [errorMsg, setErrorMsg] = useState('')

  const passwordsMatch = form.password === form.confirmPassword && form.confirmPassword.length > 0
  const canSubmit = allRulesPassed(form.password) && passwordsMatch

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errorMsg) setErrorMsg('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSubmit || view === 'loading') return

    setView('loading')
    setErrorMsg('')

    try {
      await resetPassword({ token, password: form.password })
      setView('success')
    } catch (err) {
      if (isTokenProblem(err)) {
        setView('invalid-link')
        return
      }
      setErrorMsg(friendlyError(err))
      setView('form')
    }
  }

  const isLoading = view === 'loading'

  return (
    <AnimatePresence mode="wait">
      {/* ── SUCCESS ── */}
      {view === 'success' && (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
        >
          <div className="rounded-2xl border border-white/10 p-8 md:p-10 text-center" style={cardStyle}>
            <div className="flex flex-col items-center gap-6">
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
                <h1 className="text-2xl font-bold tracking-tight mb-2">Password updated</h1>
                <p className="text-sm text-gray-400">
                  Your password has been reset and all your devices have been signed out.
                  Sign in with your new password to continue.
                </p>
              </div>

              <Link href="/auth/login" className="w-full block">
                <Button
                  className="w-full h-11 font-semibold rounded-lg text-white transition-all hover:opacity-90"
                  style={primaryBtnStyle}
                >
                  Sign in
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── INVALID / EXPIRED LINK ── */}
      {view === 'invalid-link' && (
        <motion.div
          key="invalid"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
        >
          <div className="rounded-2xl border border-white/10 p-8 md:p-10 text-center" style={cardStyle}>
            <div className="flex flex-col items-center gap-6">
              <div
                className="flex items-center justify-center w-16 h-16 rounded-2xl"
                style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}
              >
                <LinkIcon className="w-8 h-8 text-red-400" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">This link no longer works</h1>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Reset links expire after a short time and can only be used once. Request a new
                  one to continue.
                </p>
              </div>

              <Link href="/auth/forgot-password" className="w-full block">
                <Button
                  className="w-full h-11 font-semibold rounded-lg text-white transition-all hover:opacity-90"
                  style={primaryBtnStyle}
                >
                  Request a new link
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── FORM ── */}
      {(view === 'form' || view === 'loading') && (
        <motion.div
          key="form"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-2xl border border-white/10 p-8 md:p-10" style={cardStyle}>
            <div className="mb-8 text-center">
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                style={{ background: 'rgba(0,43,157,0.12)', border: '1px solid rgba(0,43,157,0.25)' }}
              >
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-1.5">Set a new password</h1>
              <p className="text-sm text-gray-400">
                Choose a strong password you haven&apos;t used before.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <PasswordInput
                  id="password"
                  name="password"
                  label="New Password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                />
                {form.password.length > 0 && <StrengthBar password={form.password} />}
              </div>

              {form.password.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-2 gap-x-4 gap-y-1.5 p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {PASSWORD_RULES.map((rule) => (
                    <RuleItem key={rule.label} rule={rule} value={form.password} />
                  ))}
                </motion.ul>
              )}

              <div>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm New Password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                {form.confirmPassword.length > 0 && (
                  <p
                    className="text-xs mt-1.5 flex items-center gap-1.5"
                    style={{ color: passwordsMatch ? '#22c55e' : '#ef4444' }}
                  >
                    {passwordsMatch ? (
                      <><Check className="w-3 h-3" /> Passwords match</>
                    ) : (
                      <><X className="w-3 h-3" /> Passwords do not match</>
                    )}
                  </p>
                )}
              </div>

              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-start gap-3 p-4 rounded-xl"
                    style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{errorMsg}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={!canSubmit || isLoading}
                className="w-full h-11 font-semibold rounded-lg text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                style={primaryBtnStyle}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                    />
                    Updating password…
                  </>
                ) : (
                  <>
                    Update password
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function ResetPasswordPage() {
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
          {/* useSearchParams requires a Suspense boundary in the App Router */}
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>

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