// app/auth/signup/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LandingHeader } from '@/components/shared/LandingHeader'
import { Footer } from '@/components/shared/Footer'
import {
  Mail, Lock, User, Building2, Phone, MapPin,
  ArrowRight, MessageCircle, BarChart3, Tag,
} from 'lucide-react'
import { motion } from 'framer-motion'

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

type FormData = {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  password: string
  confirmPassword: string
  businessName: string
  businessCategory: string
  address: string
  referralCode: string
}

function FieldIcon({ icon: Icon }: { icon: React.ElementType }) {
  return <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
}

const inputClass =
  'pl-10 h-11 bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all'

const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wide'

export default function SignUpPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessCategory: '',
    address: '',
    referralCode: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Sign up data:', formData)
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
          background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(0,43,157,0.09) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-5 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-xl"
        >
          {/* Card */}
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
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-1.5">Create your OgaOS account</h1>
              <p className="text-sm text-gray-400">
                Start managing your business like an Oga — free to begin
              </p>
            </div>

            {/* Social buttons */}
            <div className="mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <GoogleLogo />
                Continue with Google
              </Button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 text-gray-500 tracking-wide uppercase">
                  or sign up with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Section: Personal Info */}
              <div>
                <p className="text-[10px] font-semibold tracking-widest text-gray-600 uppercase mb-3">
                  Personal Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className={labelClass}>First Name *</Label>
                    <div className="relative">
                      <FieldIcon icon={User} />
                      <Input id="firstName" name="firstName" required placeholder="Oga"
                        className={inputClass} value={formData.firstName} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className={labelClass}>Last Name *</Label>
                    <div className="relative">
                      <FieldIcon icon={User} />
                      <Input id="lastName" name="lastName" required placeholder="Tunde"
                        className={inputClass} value={formData.lastName} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phoneNumber" className={labelClass}>Phone Number *</Label>
                    <div className="relative">
                      <FieldIcon icon={Phone} />
                      <Input id="phoneNumber" name="phoneNumber" type="tel" required
                        placeholder="+234 80X XXX XXXX"
                        className={inputClass} value={formData.phoneNumber} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className={labelClass}>Email *</Label>
                    <div className="relative">
                      <FieldIcon icon={Mail} />
                      <Input id="email" name="email" type="email" required
                        placeholder="you@business.com"
                        className={inputClass} value={formData.email} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Password */}
              <div>
                <p className="text-[10px] font-semibold tracking-widest text-gray-600 uppercase mb-3">
                  Security
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className={labelClass}>Password *</Label>
                    <div className="relative">
                      <FieldIcon icon={Lock} />
                      <Input id="password" name="password" type="password" required
                        placeholder="••••••••"
                        className={inputClass} value={formData.password} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className={labelClass}>Confirm Password *</Label>
                    <div className="relative">
                      <FieldIcon icon={Lock} />
                      <Input id="confirmPassword" name="confirmPassword" type="password" required
                        placeholder="••••••••"
                        className={inputClass} value={formData.confirmPassword} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Business Info */}
              <div>
                <p className="text-[10px] font-semibold tracking-widest text-gray-600 uppercase mb-3">
                  Business Details
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="businessName" className={labelClass}>Business Name *</Label>
                      <div className="relative">
                        <FieldIcon icon={Building2} />
                        <Input id="businessName" name="businessName" required
                          placeholder="Tunde Ventures"
                          className={inputClass} value={formData.businessName} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="businessCategory" className={labelClass}>Category *</Label>
                      <div className="relative">
                        <FieldIcon icon={BarChart3} />
                        <Input id="businessCategory" name="businessCategory" required
                          placeholder="Provisions, Fashion…"
                          className={inputClass} value={formData.businessCategory} onChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="address" className={labelClass}>Business Address <span className="normal-case text-gray-600">(optional)</span></Label>
                    <div className="relative">
                      <FieldIcon icon={MapPin} />
                      <Input id="address" name="address"
                        placeholder="12 Lagos Street, Ikeja"
                        className={inputClass} value={formData.address} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="referralCode" className={labelClass}>Referral Code <span className="normal-case text-gray-600">(optional)</span></Label>
                    <div className="relative">
                      <FieldIcon icon={Tag} />
                      <Input id="referralCode" name="referralCode"
                        placeholder="e.g. OG1234"
                        className={inputClass + ' pl-10'} value={formData.referralCode} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-11 font-semibold rounded-lg text-white transition-all hover:opacity-90 active:scale-[0.99]"
                style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 100%)' }}
              >
                Create Account
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>

              {/* Sign in link */}
              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Sign in
                </Link>
              </p>

              {/* Terms */}
              <p className="text-center text-xs text-gray-600">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}