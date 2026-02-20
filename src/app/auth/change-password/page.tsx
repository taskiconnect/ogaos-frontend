// app/auth/change-password/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LandingHeader } from '@/components/shared/LandingHeader'
import { Footer } from '@/components/shared/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock, Eye, EyeOff, ArrowRight, CheckCircle2,
  ShieldCheck, AlertCircle, Check, X,
} from 'lucide-react'

type SubmitState = 'idle' | 'loading' | 'success' | 'error'

interface PasswordRule {
  label: string
  test: (v: string) => boolean
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters',        test: (v) => v.length >= 8 },
  { label: 'One uppercase letter',          test: (v) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter',          test: (v) => /[a-z]/.test(v) },
  { label: 'One number',                    test: (v) => /\d/.test(v) },
  { label: 'One special character (!@#…)',  test: (v) => /[^A-Za-z0-9]/.test(v) },
]

function StrengthBar({ password }: { password: string }) {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length
  const pct    = (passed / PASSWORD_RULES.length) * 100

  const color =
    passed <= 1 ? '#ef4444' :
    passed <= 2 ? '#f97316' :
    passed <= 3 ? '#eab308' :
    passed <= 4 ? 'var(--color-primary)' :
                  '#22c55e'

  const label =
    passed === 0 ? '' :
    passed <= 1  ? 'Very weak' :
    passed <= 2  ? 'Weak' :
    passed <= 3  ? 'Fair' :
    passed <= 4  ? 'Good' :
                   'Strong'

  return (
    <div className="space-y-1.5 mt-1">
      <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      {label && (
        <p className="text-xs" style={{ color }}>
          {label}
        </p>
      )}
    </div>
  )
}

function RuleItem({ rule, value }: { rule: PasswordRule; value: string }) {
  const ok = rule.test(value)
  return (
    <li className="flex items-center gap-2 text-xs transition-colors" style={{ color: ok ? '#22c55e' : '#6b7280' }}>
      {ok
        ? <Check className="w-3 h-3 shrink-0" />
        : <X className="w-3 h-3 shrink-0" />
      }
      {rule.label}
    </li>
  )
}

function PasswordInput({
  id, name, value, onChange, placeholder, label, extra,
}: {
  id: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  label: string
  extra?: React.ReactNode
}) {
  const [show, setShow] = useState(false)

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <Label htmlFor={id} className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          {label}
        </Label>
        {extra}
      </div>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <Input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          placeholder={placeholder ?? '••••••••'}
          value={value}
          onChange={onChange}
          required
          className="pl-10 pr-11 h-11 bg-white/5 border-white/10 text-white placeholder-gray-600
                     focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

export default function ChangePasswordPage() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (submitState === 'error') setSubmitState('idle')
  }

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(form.newPassword))
  const passwordsMatch = form.newPassword === form.confirmPassword && form.confirmPassword.length > 0
  const canSubmit =
    form.currentPassword.length >= 6 &&
    allRulesPassed &&
    passwordsMatch

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSubmit) return

    setSubmitState('loading')

    // TODO: call PATCH /auth/change-password with { current_password, new_password }
    // This pairs with AuthService.Login (to verify current password) then updates the hash.
    // Example:
    // await fetch('/api/auth/change-password', {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    //   body: JSON.stringify({ current_password: form.currentPassword, new_password: form.newPassword }),
    // })

    await new Promise((r) => setTimeout(r, 1800)) // mock delay

    // Mock: simulate wrong current password if it's literally "wrong"
    if (form.currentPassword === 'wrong') {
      setErrorMsg('Your current password is incorrect. Please try again.')
      setSubmitState('error')
    } else {
      setSubmitState('success')
    }
  }

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
          background: 'radial-gradient(ellipse 60% 50% at 50% 55%, rgba(0,43,157,0.09) 0%, transparent 70%)',
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

            {/* ── SUCCESS STATE ── */}
            {submitState === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
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
                      style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.30)' }}
                    >
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </motion.div>

                    <div>
                      <h1 className="text-2xl font-bold tracking-tight mb-2">Password changed!</h1>
                      <p className="text-sm text-gray-400">
                        Your password has been updated successfully. All other sessions have been
                        signed out for your security.
                      </p>
                    </div>

                    <Link href="/auth/login" className="w-full block">
                      <Button
                        className="w-full h-11 font-semibold rounded-lg text-white transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 100%)' }}
                      >
                        Sign In again
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (

              /* ── FORM STATE ── */
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="rounded-2xl border border-white/10 p-8 md:p-10"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 0 0 1px rgba(0,43,157,0.08), 0 24px 64px rgba(0,0,0,0.5)',
                  }}
                >
                  {/* Header */}
                  <div className="mb-8 text-center">
                    <div
                      className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                      style={{ background: 'rgba(0,43,157,0.12)', border: '1px solid rgba(0,43,157,0.25)' }}
                    >
                      <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1.5">Change Password</h1>
                    <p className="text-sm text-gray-400">
                      Keep your OgaOS account secure with a strong password
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Current password */}
                    <PasswordInput
                      id="currentPassword"
                      name="currentPassword"
                      label="Current Password"
                      value={form.currentPassword}
                      onChange={handleChange}
                      placeholder="Your current password"
                      extra={
                        <Link
                          href="/auth/forgot-password"
                          className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          Forgot it?
                        </Link>
                      }
                    />

                    {/* Divider */}
                    <div className="border-t border-white/6 pt-1" />

                    {/* New password */}
                    <div>
                      <PasswordInput
                        id="newPassword"
                        name="newPassword"
                        label="New Password"
                        value={form.newPassword}
                        onChange={handleChange}
                      />
                      {/* Strength bar */}
                      {form.newPassword.length > 0 && (
                        <StrengthBar password={form.newPassword} />
                      )}
                    </div>

                    {/* Password rules checklist */}
                    {form.newPassword.length > 0 && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-2 gap-x-4 gap-y-1.5 p-4 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        {PASSWORD_RULES.map((rule) => (
                          <RuleItem key={rule.label} rule={rule} value={form.newPassword} />
                        ))}
                      </motion.ul>
                    )}

                    {/* Confirm new password */}
                    <div>
                      <PasswordInput
                        id="confirmPassword"
                        name="confirmPassword"
                        label="Confirm New Password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                      />
                      {/* Match indicator */}
                      {form.confirmPassword.length > 0 && (
                        <p
                          className="text-xs mt-1.5 flex items-center gap-1.5"
                          style={{ color: passwordsMatch ? '#22c55e' : '#ef4444' }}
                        >
                          {passwordsMatch
                            ? <><Check className="w-3 h-3" /> Passwords match</>
                            : <><X className="w-3 h-3" /> Passwords do not match</>
                          }
                        </p>
                      )}
                    </div>

                    {/* Error banner */}
                    <AnimatePresence>
                      {submitState === 'error' && (
                        <motion.div
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

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={!canSubmit || submitState === 'loading'}
                      className="w-full h-11 font-semibold rounded-lg text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 100%)' }}
                    >
                      {submitState === 'loading' ? (
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
                          Update Password
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>

                    <p className="text-center text-sm text-gray-500">
                      Changed your mind?{' '}
                      <Link href="/dashboard" className="text-primary hover:text-primary/80 font-medium transition-colors">
                        Back to dashboard
                      </Link>
                    </p>
                  </form>
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