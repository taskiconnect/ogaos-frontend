'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Building2, MapPin, Globe, BadgeCheck, ArrowLeft, Mail, Phone,
  Users, CreditCard, Calendar, Clock, CheckCircle2, XCircle, Loader2,
  Gift, TimerReset, Ban,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminDashboardHeader from '@/components/admin/AdminDashboardHeader'
import { useAdminAuthStore } from '@/stores/adminAuthStore'
import { useAdminBusinessDetail } from '@/lib/hooks/useAdminBusinesses'
import { setAdminBusinessVerified, cancelAdminBusinessSubscription } from '@/lib/api/admin'
import VerifyBusinessModal from '@/components/admin/business/VerifyBusinessModal'
import CompSubscriptionModal from '@/components/admin/business/CompSubscriptionModal'
import ExtendSubscriptionModal from '@/components/admin/business/ExtendSubscriptionModal'
import CancelSubscriptionModal from '@/components/admin/business/CancelSubscriptionModal'

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

function DetailRow({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className="w-4 h-4 text-gray-600 shrink-0" />
        <span className="text-sm text-gray-400 truncate">{label}</span>
      </div>
      <span className={cn('text-sm font-medium text-right', valueClass ?? 'text-white')}>
        {value}
      </span>
    </div>
  )
}

type ModalKind = 'verify' | 'comp' | 'extend' | 'cancel' | null

export default function AdminBusinessDetailPage() {
  const { user } = useAdminAuthStore()
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const businessId = params.id

  const { data: business, isLoading, isError } = useAdminBusinessDetail(businessId)

  const [modal, setModal] = useState<ModalKind>(null)

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin-business', businessId] })
    qc.invalidateQueries({ queryKey: ['admin-businesses'] })
  }

  const verifyMutation = useMutation({
    mutationFn: (isVerified: boolean) => setAdminBusinessVerified(businessId, isVerified),
    onSuccess: () => {
      toast.success(business?.is_verified ? 'Verification removed.' : 'Business verified.')
      refresh()
      setModal(null)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to update verification.')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelAdminBusinessSubscription(businessId),
    onSuccess: () => {
      toast.success('Subscription cancelled.')
      refresh()
      setModal(null)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to cancel subscription.')
    },
  })

  if (!user) return null

  return (
    <div className="min-h-screen bg-background text-white">
      <AdminSidebar admin={user} />

      <div className="lg:pl-72">
        <AdminDashboardHeader admin={user} />

        <main className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 pb-20">
          <button
            onClick={() => router.push('/admin/dashboard/businesses')}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to businesses
          </button>

          {isLoading && (
            <div className="p-10 flex items-center justify-center text-sm text-gray-500 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading business...
            </div>
          )}

          {isError && !isLoading && (
            <div className="p-10 text-center text-sm text-red-400">
              Couldn't load this business. It may not exist, or something went wrong.
            </div>
          )}

          {business && (
            <>
              {/* Hero */}
              <div className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden">
                <div
                  className="h-24 sm:h-28 w-full"
                  style={{ background: 'linear-gradient(135deg, #001a6e 0%, #0a2a8a 50%, #1a4fc4 100%)' }}
                />
                <div className="px-6 pb-6 -mt-10 sm:-mt-12 flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-background bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                    {business.logo_url
                      ? <img src={business.logo_url} alt="" className="w-full h-full object-cover" />
                      : <Building2 className="w-8 h-8 text-gray-500" />}
                  </div>

                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-bold text-white">{business.name}</h1>
                      {business.is_verified && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border bg-primary/10 border-primary/20 text-primary">
                          <BadgeCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mt-0.5">{business.category} · /{business.slug}</p>
                  </div>

                  <button
                    onClick={() => setModal('verify')}
                    className={cn(
                      'self-start sm:self-auto px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all',
                      business.is_verified
                        ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                        : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/15'
                    )}
                  >
                    <BadgeCheck className="w-3.5 h-3.5" />
                    {business.is_verified ? 'Remove verification' : 'Verify business'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-7 gap-5">
                {/* Left column */}
                <div className="lg:col-span-4 space-y-5">
                  {/* Business details */}
                  <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="text-sm font-semibold text-white">Business Details</h3>
                    </div>
                    <div className="space-y-0">
                      <DetailRow icon={Building2} label="Category" value={business.category} />
                      <DetailRow
                        icon={MapPin}
                        label="Location"
                        value={
                          [business.street, business.city_town, business.local_government, business.state, business.country]
                            .filter(Boolean)
                            .join(', ') || '—'
                        }
                      />
                      <DetailRow
                        icon={Globe}
                        label="Website"
                        value={
                          business.website_url
                            ? <a href={business.website_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{business.website_url}</a>
                            : '—'
                        }
                      />
                      <DetailRow
                        icon={CheckCircle2}
                        label="Public profile"
                        value={business.is_profile_public ? 'Public' : 'Private'}
                        valueClass={business.is_profile_public ? 'text-emerald-400' : 'text-gray-500'}
                      />
                      <DetailRow icon={Users} label="Profile views" value={String(business.profile_views)} />
                      <DetailRow icon={Calendar} label="Created" value={fmtDate(business.created_at)} valueClass="text-gray-300" />
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-white">Owner</h3>
                    </div>
                    {business.owner ? (
                      <div className="space-y-0">
                        <DetailRow icon={Users} label="Name" value={business.owner.name} />
                        <DetailRow icon={Mail} label="Email" value={business.owner.email} />
                        <DetailRow icon={Phone} label="Phone" value={business.owner.phone_number || '—'} />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No owner on record for this business.</p>
                    )}
                  </div>

                  {/* Staff */}
                  <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-yellow-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-white">Staff ({business.staff?.length ?? 0})</h3>
                    </div>
                    {business.staff && business.staff.length > 0 ? (
                      <div className="space-y-2">
                        {business.staff.map((s) => (
                          <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-black/10 px-4 py-3">
                            <div className="min-w-0">
                              <p className="text-sm text-white truncate">{s.name}</p>
                              <p className="text-xs text-gray-500 truncate">{s.email}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-semibold uppercase text-gray-500">{s.role}</span>
                              {s.is_active
                                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No staff added yet.</p>
                    )}
                  </div>
                </div>

                {/* Right column — subscription */}
                <div className="lg:col-span-3 space-y-5">
                  <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-white">Subscription</h3>
                    </div>

                    {business.subscription ? (
                      <div className="space-y-0 mb-4">
                        <DetailRow icon={CreditCard} label="Plan" value={business.subscription.plan} />
                        <DetailRow
                          icon={CheckCircle2}
                          label="Status"
                          value={business.subscription.status}
                          valueClass={business.subscription.status === 'active' ? 'text-emerald-400' : 'text-yellow-400'}
                        />
                        <DetailRow icon={Calendar} label="Period start" value={fmtDate(business.subscription.current_period_start)} />
                        <DetailRow icon={Calendar} label="Period end" value={fmtDate(business.subscription.current_period_end)} />
                        {business.subscription.grace_period_ends_at && (
                          <DetailRow
                            icon={Clock}
                            label="Grace period ends"
                            value={fmtDate(business.subscription.grace_period_ends_at)}
                            valueClass="text-yellow-400"
                          />
                        )}
                        <DetailRow
                          icon={Users}
                          label="Staff limit"
                          value={business.subscription.max_staff === -1 ? 'Unlimited' : business.subscription.max_staff}
                        />
                        <DetailRow
                          icon={Building2}
                          label="Store limit"
                          value={business.subscription.max_stores === -1 ? 'Unlimited' : business.subscription.max_stores}
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mb-4">
                        No subscription on record — this business is on the default free tier.
                      </p>
                    )}

                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => setModal('comp')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all"
                      >
                        <Gift className="w-4 h-4" /> Comp a plan
                      </button>
                      <button
                        onClick={() => setModal('extend')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all"
                      >
                        <TimerReset className="w-4 h-4" /> Extend current period
                      </button>
                      <button
                        onClick={() => setModal('cancel')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 transition-all"
                      >
                        <Ban className="w-4 h-4" /> Cancel subscription
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {business && modal === 'verify' && (
        <VerifyBusinessModal
          business={business}
          onConfirm={() => verifyMutation.mutate(!business.is_verified)}
          onClose={() => setModal(null)}
          isPending={verifyMutation.isPending}
        />
      )}

      {business && modal === 'comp' && (
        <CompSubscriptionModal
          open
          onOpenChange={(v) => !v && setModal(null)}
          businessId={businessId}
          businessName={business.name}
          onSuccess={() => { refresh(); setModal(null) }}
        />
      )}

      {business && modal === 'extend' && (
        <ExtendSubscriptionModal
          open
          onOpenChange={(v) => !v && setModal(null)}
          businessId={businessId}
          businessName={business.name}
          currentPeriodEnd={business.subscription?.current_period_end ?? null}
          onSuccess={() => { refresh(); setModal(null) }}
        />
      )}

      {business && modal === 'cancel' && (
        <CancelSubscriptionModal
          businessName={business.name}
          onConfirm={() => cancelMutation.mutate()}
          onClose={() => setModal(null)}
          isPending={cancelMutation.isPending}
        />
      )}
    </div>
  )
}
