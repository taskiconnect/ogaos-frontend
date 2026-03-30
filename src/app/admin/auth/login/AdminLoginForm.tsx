// src/app/admin/auth/login/AdminLoginForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, ArrowRight, Shield, KeyRound } from 'lucide-react'

import { adminLogin, adminVerifyOTP, adminResendOTP } from '@/lib/api/admin'
import { getAdminProfile } from '@/lib/api/admin'
import { useAdminAuthStore } from '@/stores/adminAuthStore'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
})

type LoginFormInput = z.infer<typeof loginSchema>
type OTPFormInput = z.infer<typeof otpSchema>

const inputClass =
  'pl-10 h-11 bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all'
const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wide'

const cardStyle = {
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(16px)',
  boxShadow: '0 0 0 1px rgba(0,43,157,0.08), 0 24px 64px rgba(0,0,0,0.5)',
}

const iconContainerStyle = {
  background: 'rgba(0,43,157,0.12)',
  border: '1px solid rgba(0,43,157,0.25)',
}

export default function AdminLoginForm() {
  const router = useRouter()
  const { setUser, setAccessToken, setTempToken, setOTPRequired, tempToken, otpRequired } =
    useAdminAuthStore()
  const [isResending, setIsResending] = useState(false)

  const loginForm = useForm<LoginFormInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const otpForm = useForm<OTPFormInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  })

  // ── Step 1: email + password ──────────────────────────────────────────────

  const loginMutation = useMutation({
    mutationFn: adminLogin,
    onSuccess: (res) => {
      if (res.data?.otp_required) {
        setTempToken(res.data.temp_token)
        setOTPRequired(true)
        toast.success(res.data.message)
      }
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Login failed'
      toast.error(message)
    },
  })

  // ── Step 2: OTP verification ──────────────────────────────────────────────

  const otpMutation = useMutation({
    mutationFn: adminVerifyOTP,
    onSuccess: async (res) => {
      setAccessToken(res.access_token)
      toast.success(res.message)

      // Fetch full profile now that we have the access token
      try {
        const profileRes = await getAdminProfile()
        if (profileRes.success && profileRes.data) {
          setUser(profileRes.data)
        }
      } catch {
        // Non-fatal — we still have the token, let the dashboard fetch it
      }

      // Clear OTP state before navigating
      setOTPRequired(false)
      setTempToken(null)
      router.push('/admin/dashboard')
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'OTP verification failed'
      toast.error(message)
      otpForm.reset()
    },
  })

  // ── Resend OTP ────────────────────────────────────────────────────────────

  const resendOTPMutation = useMutation({
    mutationFn: adminResendOTP,
    onSuccess: () => {
      toast.success('New OTP sent to your email')
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to resend OTP'
      toast.error(message)
    },
  })

  // ── Handlers ──────────────────────────────────────────────────────────────

  const onLoginSubmit = (data: LoginFormInput) => {
    loginMutation.mutate(data)
  }

  const onOTPSubmit = (data: OTPFormInput) => {
    if (!tempToken) {
      toast.error('Session expired. Please login again.')
      setOTPRequired(false)
      setTempToken(null)
      return
    }
    otpMutation.mutate({ temp_token: tempToken, otp: data.otp })
  }

  const handleResendOTP = () => {
    if (!tempToken) {
      toast.error('Session expired. Please login again.')
      setOTPRequired(false)
      setTempToken(null)
      return
    }
    setIsResending(true)
    resendOTPMutation.mutate(
      { temp_token: tempToken },
      { onSettled: () => setIsResending(false) }
    )
  }

  const handleBackToLogin = () => {
    setOTPRequired(false)
    setTempToken(null)
    loginForm.reset()
  }

  // ── OTP screen ────────────────────────────────────────────────────────────

  if (otpRequired) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 p-8 md:p-10" style={cardStyle}>
          <div className="mb-8 text-center">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
              style={iconContainerStyle}
            >
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-1.5">
              Two-Factor Authentication
            </h1>
            <p className="text-sm text-gray-400">Enter the 6-digit code sent to your email</p>
          </div>

          <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="otp" className={labelClass}>
                Verification Code
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={6}
                  className={inputClass}
                  {...otpForm.register('otp')}
                />
              </div>
              {otpForm.formState.errors.otp && (
                <p className="text-xs text-red-400 mt-1">
                  {otpForm.formState.errors.otp.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={otpMutation.isPending}
              className="w-full h-11 font-semibold rounded-lg text-white transition-all hover:opacity-90 active:scale-[0.99]"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 100%)',
              }}
            >
              {otpMutation.isPending ? 'Verifying...' : 'Verify Code'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending || resendOTPMutation.isPending}
                className="text-sm text-primary hover:text-primary/80 disabled:opacity-50 transition-colors"
              >
                {isResending || resendOTPMutation.isPending ? 'Sending...' : 'Resend Code'}
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                ← Back to login
              </button>
            </p>
          </form>
        </div>
      </div>
    )
  }

  // ── Login screen ──────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-white/10 p-8 md:p-10" style={cardStyle}>
        <div className="mb-8 text-center">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
            style={iconContainerStyle}
          >
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-1.5">Admin Login</h1>
          <p className="text-sm text-gray-400">
            Secure access to the OgaOs platform administration
          </p>
        </div>

        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className={labelClass}>
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                id="email"
                type="email"
                placeholder="admin@ogaos.com"
                className={inputClass}
                {...loginForm.register('email')}
              />
            </div>
            {loginForm.formState.errors.email && (
              <p className="text-xs text-red-400 mt-1">
                {loginForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className={labelClass}>
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className={inputClass}
                {...loginForm.register('password')}
              />
            </div>
            {loginForm.formState.errors.password && (
              <p className="text-xs text-red-400 mt-1">
                {loginForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full h-11 font-semibold rounded-lg text-white transition-all hover:opacity-90 active:scale-[0.99]"
            style={{
              background:
                'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 100%)',
            }}
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}