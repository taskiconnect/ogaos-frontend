'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { loginUser, getMe } from '@/lib/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

// Custom Google logo (lucide-react does not have it)
function GoogleLogo() {
  return (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginFormInput = z.infer<typeof loginSchema>

const inputClass = 'pl-10 h-11 bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all'
const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wide'

function getRedirectPath(role: string, isPlatform: boolean): string {
  if (isPlatform) return '/platform/dashboard'
  if (role === 'owner') return '/dashboard'
  if (role === 'staff') return '/dashboard'
  return '/dashboard'
}

export default function LoginForm() {
  const router = useRouter()
  const { setUser, setAccessToken } = useAuthStore()

  const form = useForm<LoginFormInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async (res) => {
      // Store access token so getMe can use it
      if (res.access_token) {
        setAccessToken(res.access_token)
      }

      try {
        // Fetch user profile to determine role + redirect
        const me = await getMe()
        setUser(me)

        toast.success('Welcome back! 🎉')

        const path = getRedirectPath(me.role, me.is_platform)
        router.push(path)
      } catch {
        // Login succeeded but /me failed — still redirect to a safe default
        toast.success('Welcome back! 🎉')
        router.push('/dashboard')
      }
    },
    onError: (err: any) => {
      console.error('[LOGIN ERROR]', err)
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Login failed. Check your credentials or network.'
      toast.error(message)
    },
    retry: 1,
  })

  const onSubmit = (data: LoginFormInput) => {
    mutation.mutate(data)
  }

  return (
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
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-1.5">Welcome back</h1>
        <p className="text-sm text-gray-400">
          Sign in to continue managing your business like an Oga
        </p>
      </div>

      <div className="mb-6">
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all"
          disabled
        >
          <GoogleLogo />
          Continue with Google
        </Button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 text-gray-500 tracking-wide uppercase">
            or sign in with email
          </span>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className={labelClass}>Email</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <Input
              id="email"
              type="email"
              placeholder="you@business.com"
              className={inputClass}
              {...form.register('email')}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-xs text-red-400 mt-1">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className={labelClass}>Password</Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className={inputClass}
              {...form.register('password')}
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-red-400 mt-1">{form.formState.errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full h-11 font-semibold rounded-lg text-white transition-all hover:opacity-90 active:scale-[0.99]"
          style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 100%)' }}
        >
          {mutation.isPending ? 'Signing in...' : 'Sign In'}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Sign up for free
          </Link>
        </p>
      </form>
    </div>
  )
}