'use client'

import { Crown, CalendarClock, ShieldCheck } from 'lucide-react'
import type { Subscription } from '@/lib/api/types'
import { cn } from '@/lib/utils'

function fmtDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function SubscriptionSummaryCard({ subscription }: { subscription: Subscription | null }) {
  const plan = subscription?.plan ?? 'free'
  const status = subscription?.status ?? 'active'

  return (
    <div className="rounded-3xl border border-white/10 bg-white/2 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Current Subscription</p>
          <h2 className="mt-2 text-2xl font-bold text-white capitalize">{plan}</h2>
          <p className="mt-1 text-sm text-gray-400">
            Manage your plan, billing access, and locked features.
          </p>
        </div>

        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase',
            status === 'active' || status === 'grace_period'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
              : 'border-red-500/20 bg-red-500/10 text-red-400'
          )}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          {status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase font-semibold">
            <Crown className="w-4 h-4" />
            Plan
          </div>
          <p className="mt-2 text-lg font-bold text-white capitalize">{plan}</p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase font-semibold">
            <CalendarClock className="w-4 h-4" />
            Started
          </div>
          <p className="mt-2 text-lg font-bold text-white">{fmtDate(subscription?.current_period_start ?? null)}</p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase font-semibold">
            <CalendarClock className="w-4 h-4" />
            Renews / Ends
          </div>
          <p className="mt-2 text-lg font-bold text-white">{fmtDate(subscription?.current_period_end ?? null)}</p>
        </div>
      </div>
    </div>
  )
}