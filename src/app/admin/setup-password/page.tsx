// src/app/admin/setup-password/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react'

import { adminSetupPassword } from '@/lib/api/auth'

const setupPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SetupPasswordFormInput = z.infer<typeof setupPasswordSchema>

const inputClass = 'pl-10 h-11 bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all'
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

export default function AdminSetupPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Guard against Next.js SSR/hydration: useSearchParams() returns null on the
  // first render before the client has hydrated, which would trigger the "no
  // token" redirect even when a valid token is present in the URL.
  // We wait until the component has mounted on the client before validating.
  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => {
    setHasMounted(true)
  }, [])

  const form = useForm<SetupPasswordFormInput>({
    resolver: zodResolver(setupPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  useEffect(() => {
    if (!hasMounted) return // Skip until client is fully hydrated
    if (!token) {
      toast.error('Invalid or missing setup token')
      router.push('/admin/auth/login')
    }
  }, [hasMounted, token, router])

  const mutation = useMutation({
    mutationFn: adminSetupPassword,
    onSuccess: () => {
      toast.success('Password set successfully! You can now log in.')
      router.push('/admin/auth/login')
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to set password'
      toast.error(message)
    },
  })

  const onSubmit = (data: SetupPasswordFormInput) => {
    if (!token) return
    mutation.mutate({ token, password: data.password })
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
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

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/10 p-8 md:p-10" style={cardStyle}>
            <div className="mb-8 text-center">
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                style={iconContainerStyle}
              >
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-1.5">Set Your Password</h1>
              <p className="text-sm text-gray-400">Create a secure password for your admin account</p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="password" className={labelClass}>New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={inputClass}
                    {...form.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-xs text-red-400 mt-1">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className={labelClass}>Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={inputClass}
                    {...form.register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={mutation.isPending || !hasMounted || !token}
                className="w-full h-11 font-semibold rounded-lg text-white transition-all hover:opacity-90 active:scale-[0.99]"
                style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 100%)' }}
              >
                {mutation.isPending ? 'Setting Password...' : 'Set Password'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}