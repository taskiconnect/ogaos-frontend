'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { registerUser, getNigeriaStates, getNigeriaLGAs } from '@/lib/api/auth'
import { registerSchema, SignUpFormInput } from '@/lib/validators/auth'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Mail, Lock, User, Building2, Phone, MapPin,
  ArrowRight, Tag, Map, Globe, ChevronDown,
  Search, Check, BarChart3,
} from 'lucide-react'
import Link from 'next/link'

// ─────────────────────────────────────────────────────────
// Business categories
// ─────────────────────────────────────────────────────────

const BUSINESS_CATEGORIES = [
  'Agriculture & Farming',
  'Automotive & Vehicles',
  'Beauty & Personal Care',
  'Cleaning & Laundry',
  'Construction & Real Estate',
  'Consulting & Professional Services',
  'Education & Training',
  'Electronics & Gadgets',
  'Entertainment & Events',
  'Fashion & Clothing',
  'Food & Beverages',
  'Furniture & Home Decor',
  'General Merchandise / Provisions',
  'Healthcare & Pharmacy',
  'Hotels & Hospitality',
  'ICT & Software',
  'Jewellery & Accessories',
  'Logistics & Delivery',
  'Manufacturing',
  'Media & Advertising',
  'Oil & Gas',
  'Photography & Videography',
  'Printing & Publishing',
  'Religious Organisation',
  'Repairs & Maintenance',
  'Restaurant & Catering',
  'Retail & Wholesale',
  'Security Services',
  'Skincare & Cosmetics',
  'Supermarket & Grocery',
  'Tailoring & Fashion Design',
  'Telecommunications',
  'Transport & Haulage',
  'Travel & Tourism',
  'Veterinary & Pet Services',
  'Other',
]

// ─────────────────────────────────────────────────────────
// Reusable searchable combobox
// ─────────────────────────────────────────────────────────

interface SearchableDropdownProps {
  id: string
  value: string
  placeholder: string
  options: string[]
  disabled?: boolean
  isLoading?: boolean
  onChange: (val: string) => void
}

function SearchableDropdown({
  id,
  value,
  placeholder,
  options,
  disabled = false,
  isLoading = false,
  onChange,
}: SearchableDropdownProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [open])

  const handleSelect = (option: string) => {
    onChange(option)
    setOpen(false)
    setQuery('')
  }

  const triggerClass =
    'w-full h-11 flex items-center justify-between px-3 bg-white/5 border border-white/10 text-white rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-40 disabled:cursor-not-allowed'

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled || isLoading}
        className={triggerClass}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={value ? 'text-white' : 'text-gray-600'}>
          {isLoading ? 'Loading…' : value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-white/10 bg-zinc-900 shadow-xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
            <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
            />
          </div>

          {/* Options list */}
          <ul
            role="listbox"
            className="max-h-52 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500">No results</li>
            ) : (
              filtered.map((option) => (
                <li
                  key={option}
                  role="option"
                  aria-selected={value === option}
                  onClick={() => handleSelect(option)}
                  className="flex items-center justify-between px-3 py-2 text-sm text-white cursor-pointer hover:bg-white/10 transition-colors"
                >
                  {option}
                  {value === option && <Check className="w-3.5 h-3.5 text-primary" />}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Misc helpers
// ─────────────────────────────────────────────────────────

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

const inputClass =
  'pl-10 h-11 bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all'
const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wide'

function FieldIcon({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-red-400 mt-1">{message}</p>
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-widest text-gray-600 uppercase mb-3">
      {children}
    </p>
  )
}

// ─────────────────────────────────────────────────────────
// Main form
// ─────────────────────────────────────────────────────────

export default function RegisterForm() {
  const router = useRouter()
  const [selectedState, setSelectedState] = useState<string>('')

  const form = useForm<SignUpFormInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone_number: '',
      email: '',
      password: '',
      confirmPassword: '',
      business_name: '',
      business_category: '',
      street: '',
      city_town: '',
      local_government: '',
      state: '',
      country: 'Nigeria',
      referral_code: '',
    },
  })

  // States — fetched once, cached forever (static data)
  const { data: states = [], isLoading: statesLoading } = useQuery({
    queryKey: ['nigeria-states'],
    queryFn: getNigeriaStates,
    staleTime: Infinity,
    gcTime: Infinity,
  })

  // LGAs — fetched per state, cached forever
  const { data: lgas = [], isLoading: lgasLoading } = useQuery({
    queryKey: ['nigeria-lgas', selectedState],
    queryFn: () => getNigeriaLGAs(selectedState),
    enabled: !!selectedState,
    staleTime: Infinity,
    gcTime: Infinity,
  })

  const mutation = useMutation({
    mutationFn: async (values: SignUpFormInput) => {
      const { confirmPassword, ...payload } = values
      return registerUser(payload)
    },
    onSuccess: () => {
      router.push('/auth/signupsuccess')
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Registration failed. Please check your details.'
      toast.error(message)
    },
  })

  const onSubmit = (data: SignUpFormInput) => mutation.mutate(data)

  return (
    <>
      {/* Header */}
      <div className="mb-8 text-center">
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
          style={{ background: 'rgba(0,43,157,0.12)', border: '1px solid rgba(0,43,157,0.25)' }}
        >
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-1.5">Create your OgaOS account</h1>
        <p className="text-sm text-gray-400">Start managing your business like an Oga — free to begin</p>
      </div>

      {/* Google SSO (placeholder) */}
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
          <span className="px-3 text-gray-500 tracking-wide uppercase">or sign up with email</span>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>

        {/* ── Personal Information ── */}
        <section>
          <SectionLabel>Personal Information</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="first_name" className={labelClass}>First Name *</Label>
              <div className="relative">
                <FieldIcon icon={User} />
                <Input id="first_name" {...form.register('first_name')} className={inputClass} placeholder="Oga" autoComplete="given-name" />
              </div>
              <FieldError message={form.formState.errors.first_name?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="last_name" className={labelClass}>Last Name *</Label>
              <div className="relative">
                <FieldIcon icon={User} />
                <Input id="last_name" {...form.register('last_name')} className={inputClass} placeholder="Tunde" autoComplete="family-name" />
              </div>
              <FieldError message={form.formState.errors.last_name?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone_number" className={labelClass}>Phone Number *</Label>
              <div className="relative">
                <FieldIcon icon={Phone} />
                <Input id="phone_number" {...form.register('phone_number')} className={inputClass} placeholder="+234 80X XXX XXXX" autoComplete="tel" inputMode="tel" />
              </div>
              <FieldError message={form.formState.errors.phone_number?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className={labelClass}>Email *</Label>
              <div className="relative">
                <FieldIcon icon={Mail} />
                <Input id="email" {...form.register('email')} type="email" className={inputClass} placeholder="you@business.com" autoComplete="email" />
              </div>
              <FieldError message={form.formState.errors.email?.message} />
            </div>
          </div>
        </section>

        {/* ── Security ── */}
        <section>
          <SectionLabel>Security</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="password" className={labelClass}>Password *</Label>
              <div className="relative">
                <FieldIcon icon={Lock} />
                <Input id="password" {...form.register('password')} type="password" className={inputClass} placeholder="••••••••" autoComplete="new-password" />
              </div>
              <FieldError message={form.formState.errors.password?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className={labelClass}>Confirm Password *</Label>
              <div className="relative">
                <FieldIcon icon={Lock} />
                <Input id="confirmPassword" {...form.register('confirmPassword')} type="password" className={inputClass} placeholder="••••••••" autoComplete="new-password" />
              </div>
              <FieldError message={form.formState.errors.confirmPassword?.message} />
            </div>
          </div>
        </section>

        {/* ── Business Details ── */}
        <section>
          <SectionLabel>Business Details</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="business_name" className={labelClass}>Business Name *</Label>
              <div className="relative">
                <FieldIcon icon={Building2} />
                <Input id="business_name" {...form.register('business_name')} className={inputClass} placeholder="Tunde Ventures" />
              </div>
              <FieldError message={form.formState.errors.business_name?.message} />
            </div>

            <div className="space-y-1.5">
              <Label className={labelClass}>Category *</Label>
              <SearchableDropdown
                id="business_category"
                value={form.watch('business_category')}
                placeholder="Select category"
                options={BUSINESS_CATEGORIES}
                onChange={(val) => form.setValue('business_category', val, { shouldValidate: true })}
              />
              <FieldError message={form.formState.errors.business_category?.message} />
            </div>
          </div>
        </section>

        {/* ── Business Address ── */}
        <section>
          <SectionLabel>Business Address</SectionLabel>
          <div className="space-y-4">

            {/* Street */}
            <div className="space-y-1.5">
              <Label htmlFor="street" className={labelClass}>Street *</Label>
              <div className="relative">
                <FieldIcon icon={MapPin} />
                <Input id="street" {...form.register('street')} className={inputClass} placeholder="12 Allen Avenue" autoComplete="street-address" />
              </div>
              <FieldError message={form.formState.errors.street?.message} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* City / Town */}
              <div className="space-y-1.5">
                <Label htmlFor="city_town" className={labelClass}>City / Town *</Label>
                <div className="relative">
                  <FieldIcon icon={Map} />
                  <Input id="city_town" {...form.register('city_town')} className={inputClass} placeholder="Ikeja" autoComplete="address-level2" />
                </div>
                <FieldError message={form.formState.errors.city_town?.message} />
              </div>

              {/* State — searchable dropdown via API */}
              <div className="space-y-1.5">
                <Label className={labelClass}>State *</Label>
                <SearchableDropdown
                  id="state"
                  value={form.watch('state')}
                  placeholder="Select state"
                  options={states}
                  isLoading={statesLoading}
                  onChange={(val) => {
                    setSelectedState(val)
                    form.setValue('state', val, { shouldValidate: true })
                    form.setValue('local_government', '', { shouldValidate: false })
                  }}
                />
                <FieldError message={form.formState.errors.state?.message} />
              </div>

              {/* LGA — searchable dropdown via API, depends on state */}
              <div className="space-y-1.5">
                <Label className={labelClass}>Local Government *</Label>
                <SearchableDropdown
                  id="local_government"
                  value={form.watch('local_government')}
                  placeholder={!selectedState ? 'Select state first' : 'Select LGA'}
                  options={lgas}
                  disabled={!selectedState}
                  isLoading={lgasLoading}
                  onChange={(val) => form.setValue('local_government', val, { shouldValidate: true })}
                />
                <FieldError message={form.formState.errors.local_government?.message} />
              </div>

              {/* Country — pre-filled, editable */}
              <div className="space-y-1.5">
                <Label htmlFor="country" className={labelClass}>Country *</Label>
                <div className="relative">
                  <FieldIcon icon={Globe} />
                  <Input id="country" {...form.register('country')} className={inputClass} autoComplete="country-name" />
                </div>
                <FieldError message={form.formState.errors.country?.message} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Referral Code — last ── */}
        <section>
          <SectionLabel>Referral</SectionLabel>
          <div className="space-y-1.5">
            <Label htmlFor="referral_code" className={labelClass}>Referral Code (optional)</Label>
            <div className="relative">
              <FieldIcon icon={Tag} />
              <Input id="referral_code" {...form.register('referral_code')} className={inputClass} placeholder="e.g. OG1234" />
            </div>
          </div>
        </section>

        {/* Submit */}
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full h-11 font-semibold rounded-lg text-white transition-all hover:opacity-90 active:scale-[0.99]"
          style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 100%)' }}
        >
          {mutation.isPending ? 'Creating account…' : 'Create Account'}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </form>
    </>
  )
}