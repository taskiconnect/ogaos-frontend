'use client'

export const dynamic = 'force-dynamic'

import { useAdminBusinessList } from '@/lib/hooks/useAdminBusinesses'
import { cn } from '@/lib/utils'
import { useAdminAuthStore } from '@/stores/adminAuthStore'
import { BadgeCheck, Building2, ChevronRight, Loader2, Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

// ─── Badge meta ───────────────────────────────────────────────────────────────

const PLAN_META: Record<string, { label: string; text: string; bg: string; border: string }> = {
  free: { label: 'Free', text: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10' },
  growth: {
    label: 'Growth',
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  pro: { label: 'Pro', text: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
  custom: {
    label: 'Custom',
    text: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
}

const SUB_STATUS_META: Record<string, { label: string; text: string; bg: string; border: string }> =
  {
    active: {
      label: 'Active',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    grace_period: {
      label: 'Grace period',
      text: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
    },
    expired: {
      label: 'Expired',
      text: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
    },
    cancelled: {
      label: 'Cancelled',
      text: 'text-gray-500',
      bg: 'bg-white/5',
      border: 'border-white/10',
    },
  }

function PlanBadge({ plan }: { plan?: string }) {
  const meta = PLAN_META[plan ?? ''] ?? {
    label: plan ?? '—',
    text: 'text-gray-500',
    bg: 'bg-white/5',
    border: 'border-white/10',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap',
        meta.bg,
        meta.border,
        meta.text,
      )}
    >
      {meta.label}
    </span>
  )
}

function SubStatusBadge({ status }: { status?: string }) {
  const meta = SUB_STATUS_META[status ?? ''] ?? {
    label: status ?? 'No subscription',
    text: 'text-gray-500',
    bg: 'bg-white/5',
    border: 'border-white/10',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap',
        meta.bg,
        meta.border,
        meta.text,
      )}
    >
      {meta.label}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminBusinessesPage() {
  const { user } = useAdminAuthStore()

  const [search, setSearch] = useState('')
  const [verified, setVerified] = useState('')
  const [plan, setPlan] = useState('')
  const [subStatus, setSubStatus] = useState('')

  const { businesses, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, isError } =
    useAdminBusinessList({
      search: search || undefined,
      is_verified: verified === '' ? undefined : verified === 'true',
      plan: plan || undefined,
      subscription_status: subStatus || undefined,
      limit: 20,
    })

  if (!user) return null

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="">
        <main className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 pb-20">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Businesses</h1>
            <p className="text-gray-400 mt-1 text-sm">
              Every business on the platform, their owners, and their current subscription
            </p>
          </div>

          {/* Filters */}
          <div className="rounded-2xl border border-white/8 bg-white/2 p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, slug, or owner email"
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/40"
                />
              </div>

              <select
                value={verified}
                onChange={(e) => setVerified(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-primary/40"
              >
                <option value="">Verified & unverified</option>
                <option value="true">Verified only</option>
                <option value="false">Unverified only</option>
              </select>

              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-primary/40"
              >
                <option value="">All plans</option>
                <option value="free">Free</option>
                <option value="growth">Growth</option>
                <option value="pro">Pro</option>
                <option value="custom">Custom</option>
              </select>

              <select
                value={subStatus}
                onChange={(e) => setSubStatus(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-primary/40"
              >
                <option value="">Any subscription status</option>
                <option value="active">Active</option>
                <option value="grace_period">Grace period</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* List */}
          <div className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden">
            {isLoading && (
              <div className="p-10 flex items-center justify-center text-sm text-gray-500 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading businesses...
              </div>
            )}

            {isError && !isLoading && (
              <div className="p-10 text-center text-sm text-red-400">
                Couldn&apos;t load businesses. Try refreshing the page.
              </div>
            )}

            {!isLoading && !isError && businesses.length === 0 && (
              <div className="p-10 text-center text-sm text-gray-500">
                No businesses match these filters.
              </div>
            )}

            {!isLoading && businesses.length > 0 && (
              <div className="divide-y divide-white/5">
                {businesses.map((b) => (
                  <Link
                    key={b.id}
                    href={`/admin/dashboard/businesses/${b.id}`}
                    className="flex items-center gap-4 px-4 sm:px-5 py-4 hover:bg-white/3 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {b.logo_url ? (
                        <img src={b.logo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-4 h-4 text-gray-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white truncate">{b.name}</p>
                        {b.is_verified && (
                          <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {b.owner ? `${b.owner.name} · ${b.owner.email}` : 'No owner on record'}
                      </p>
                    </div>

                    <div className="hidden sm:block text-xs text-gray-500 w-36 truncate">
                      {b.city_town || b.state
                        ? `${b.city_town}${b.city_town && b.state ? ', ' : ''}${b.state}`
                        : '—'}
                    </div>

                    <div className="hidden md:flex w-24 shrink-0">
                      <PlanBadge plan={b.subscription?.plan} />
                    </div>

                    <div className="hidden md:flex w-32 shrink-0">
                      <SubStatusBadge status={b.subscription?.status} />
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {hasNextPage && (
            <div className="flex justify-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-50 transition-all"
              >
                {isFetchingNextPage && <Loader2 className="w-4 h-4 animate-spin" />}
                Load more
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
