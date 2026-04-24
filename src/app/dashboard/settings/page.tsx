'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getBusiness,
  updateBusiness,
  setBusinessVisibility,
  listStaff,
} from '@/lib/api/business'
import { getStates, getLGAs } from '@/lib/api/location'
import { deactivateStaff } from '@/lib/api/auth'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { Check, Globe, Loader2, MapPinned } from 'lucide-react'
import { cn } from '@/lib/utils'

import Section from '@/components/settings/Section'
import BusinessAvatar from '@/components/settings/BusinessAvatar'
import LocationSelect from '@/components/settings/LocationSelect'
import StorefrontLink from '@/components/settings/StorefrontLink'
import StorefrontGallery from '@/components/settings/StorefrontGallery'
import PayoutAccountSection from '@/components/settings/PayoutAccountSection'
import BusinessKeywordsSection from '@/components/settings/BusinessKeywordsSection'
import { StaffRow, AddStaffInline } from '@/components/settings/StaffSection'

export default function SettingsPage() {
  const qc = useQueryClient()

  const { data: business, isLoading } = useQuery({
    queryKey: ['business'],
    queryFn: getBusiness,
  })

  // ✅ Fix: wrap listStaff in an arrow function so TanStack Query's
  // QueryFunctionContext is not passed as the params argument.
  const { data: staffList } = useQuery({
    queryKey: ['staff'],
    queryFn: () => listStaff(),
  })

  const { data: states = [], isLoading: statesLoading } = useQuery({
    queryKey: ['location-states'],
    queryFn: getStates,
    staleTime: 1000 * 60 * 60,
  })

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [street, setStreet] = useState('')
  const [cityTown, setCityTown] = useState('')
  const [localGovt, setLocalGovt] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('Nigeria')
  const [initialised, setInitialised] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState('')

  const previousStateRef = useRef<string>('')

  const { data: lgas = [], isLoading: lgasLoading } = useQuery({
    queryKey: ['location-lgas', state],
    queryFn: () => getLGAs(state),
    enabled: !!state.trim(),
    staleTime: 1000 * 60 * 60,
  })

  useEffect(() => {
    if (business && !initialised) {
      setName(business.name ?? '')
      setCategory(business.category ?? '')
      setDescription(business.description ?? '')
      setWebsiteUrl(business.website_url ?? '')
      setStreet(business.street ?? '')
      setCityTown(business.city_town ?? '')
      setLocalGovt(business.local_government ?? '')
      setState(business.state ?? '')
      setCountry(business.country ?? 'Nigeria')
      previousStateRef.current = business.state ?? ''
      setInitialised(true)
    }
  }, [business, initialised])

  useEffect(() => {
    if (!initialised) return
    if (previousStateRef.current && previousStateRef.current !== state) setLocalGovt('')
    previousStateRef.current = state
  }, [state, initialised])

  useEffect(() => {
    if (!state || !localGovt || lgas.length === 0) return
    const exists = lgas.some((item) => item.toLowerCase() === localGovt.toLowerCase())
    if (!exists) setLocalGovt('')
  }, [lgas, localGovt, state])

  const stateOptions = useMemo(() => states, [states])
  const lgaOptions = useMemo(() => lgas, [lgas])

  const updateMut = useMutation({
    mutationFn: () =>
      updateBusiness({
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        website_url: websiteUrl.trim(),
        street: street.trim(),
        city_town: cityTown.trim(),
        local_government: localGovt.trim(),
        state: state.trim(),
        country: country.trim(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['business'] })
      setProfileSaved(true)
      setProfileError('')
      setTimeout(() => setProfileSaved(false), 3000)
    },
    onError: (e: any) => setProfileError(e?.response?.data?.message ?? 'Update failed'),
  })

  const visibilityMut = useMutation({
    mutationFn: (isPublic: boolean) => setBusinessVisibility(isPublic),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
  })

  const deactivateMut = useMutation({
    mutationFn: (staffId: string) => deactivateStaff(staffId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  })

  const staff = Array.isArray(staffList) ? staffList : []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <Sidebar />
      <div className="lg:pl-72">
        <DashboardHeader />

        <main className="p-6 lg:p-10 space-y-8 pb-20 max-w-3xl">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-gray-400 mt-1 text-sm">Manage your business profile and team</p>
          </div>

          {/* ── Business Profile ─────────────────────────────────────────── */}
          <Section title="Business Profile">
            <div className="space-y-5">
              <div className="flex items-center gap-5">
                {business && <BusinessAvatar business={business} />}
                <div>
                  <p className="text-sm font-medium text-white">{business?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{business?.category}</p>
                  <p className="text-xs text-gray-500 mt-1">Click the logo to upload a new one</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Business Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/25"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/25"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Tell customers what your business does..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Website URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourbusiness.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="rounded-2xl border border-white/8 bg-white/2 p-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <MapPinned className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Business Location</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Pick your state and local government from the official list used by search.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Street</label>
                    <input
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">City / Town</label>
                    <input
                      value={cityTown}
                      onChange={(e) => setCityTown(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Country</label>
                    <input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">State</label>
                    <LocationSelect
                      value={state}
                      onChange={setState}
                      options={stateOptions}
                      placeholder={statesLoading ? 'Loading states...' : 'Select state'}
                      disabled={statesLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Local Government</label>
                    <LocationSelect
                      value={localGovt}
                      onChange={setLocalGovt}
                      options={lgaOptions}
                      placeholder={!state ? 'Select state first' : lgasLoading ? 'Loading LGAs...' : 'Select LGA'}
                      disabled={!state || lgasLoading}
                    />
                  </div>
                </div>
              </div>

              {profileError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {profileError}
                </p>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateMut.mutate()}
                  disabled={updateMut.isPending}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
                >
                  {updateMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save Profile
                </button>

                {profileSaved && (
                  <span className="flex items-center gap-1.5 text-sm text-emerald-400 font-medium">
                    <Check className="w-4 h-4" />
                    Saved!
                  </span>
                )}
              </div>
            </div>
          </Section>

          {/* ── Keywords ─────────────────────────────────────────────────── */}
          <BusinessKeywordsSection />

          {/* ── Public Storefront ─────────────────────────────────────────── */}
          <Section title="Public Storefront">
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-sm font-medium text-white">Public storefront</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Allow customers to find and view your business online
                </p>
              </div>

              <button
                onClick={() => business && visibilityMut.mutate(!business.is_profile_public)}
                disabled={visibilityMut.isPending}
                className={cn(
                  'w-12 h-7 rounded-full border transition-all relative shrink-0 disabled:opacity-50',
                  business?.is_profile_public ? 'bg-primary border-primary' : 'bg-white/5 border-white/20'
                )}
              >
                <div
                  className={cn(
                    'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all',
                    business?.is_profile_public ? 'left-5' : 'left-0.5'
                  )}
                />
              </button>
            </div>

            {business?.slug && (
              <StorefrontLink slug={business.slug} isPublic={business.is_profile_public} />
            )}

            {business && (
              <>
                <div className="border-t border-white/5 my-2" />
                <StorefrontGallery business={business} />
              </>
            )}
          </Section>

          {/* ── Payout Account ────────────────────────────────────────────── */}
          <PayoutAccountSection />

          {/* ── Staff Management ──────────────────────────────────────────── */}
          <Section title="Staff Management">
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                You can have up to 2 staff members on the Starter plan.{' '}
                <span className="text-white font-medium">
                  {staff.filter((s: any) => s.is_active).length}
                </span>{' '}
                active now.
              </p>

              {staff.length > 0 && (
                <div className="divide-y divide-white/5">
                  {staff.map((member: any) => (
                    <StaffRow
                      key={member.id}
                      member={member}
                      onDeactivate={(id) => deactivateMut.mutate(id)}
                    />
                  ))}
                </div>
              )}

              {staff.filter((s: any) => s.is_active).length < 2 && (
                <AddStaffInline onSuccess={() => qc.invalidateQueries({ queryKey: ['staff'] })} />
              )}

              {staff.filter((s: any) => s.is_active).length >= 2 && (
                <p className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3">
                  Staff limit reached. Deactivate a member to invite someone new.
                </p>
              )}
            </div>
          </Section>

          {/* ── Account Info ──────────────────────────────────────────────── */}
          <Section title="Account Info">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Business ID</span>
                <span className="font-mono text-xs text-gray-300">{business?.id?.slice(0, 16)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Slug</span>
                <span className="font-mono text-xs text-primary">/{business?.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className={cn('text-xs font-semibold', business?.status === 'active' ? 'text-emerald-400' : 'text-yellow-400')}>
                  {business?.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Verified</span>
                <span className={business?.is_verified ? 'text-emerald-400' : 'text-gray-500'}>
                  {business?.is_verified ? 'Yes' : 'Not yet verified'}
                </span>
              </div>
            </div>
          </Section>
        </main>
      </div>
    </div>
  )
}