'use client'

import Link from 'next/link'
import { Users2, ArrowRight, Star } from 'lucide-react'
import type { Customer } from '@/lib/api/types'

function fmt(kobo: number) {
  return `₦${Math.round(kobo / 100).toLocaleString('en-NG')}`
}

const TIER_STYLE = [
  { color: '#f59e0b', bg: '#f59e0b18' }, // 1st — gold
  { color: '#94a3b8', bg: '#94a3b818' }, // 2nd — silver
  { color: '#f97316', bg: '#f9731618' }, // 3rd — bronze
  { color: '#6b7280', bg: '#6b728018' }, // 4th+
  { color: '#6b7280', bg: '#6b728018' },
]

interface Props {
  customers: Customer[]
  isLoading: boolean
}

export default function CustomersOverview({ customers, isLoading }: Props) {
  // Sort descending by total_purchases (already sorted by API if limit=5 default, but be safe)
  const sorted = [...customers].sort((a, b) => b.total_purchases - a.total_purchases)

  return (
    <div className="rounded-2xl border border-dash-border bg-dash-surface p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Users2 className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Top Customers</h3>
            <p className="text-[11px] text-muted-foreground">
              {isLoading ? '…' : `${customers.length} loaded`}
            </p>
          </div>
        </div>
        <Link href="/dashboard/customers" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
          All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 px-3">
              <div className="w-5 h-3 rounded bg-foreground/10 animate-pulse shrink-0" />
              <div className="w-8 h-8 rounded-full bg-foreground/10 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-28 rounded bg-foreground/10 animate-pulse" />
                <div className="h-2.5 w-16 rounded bg-foreground/10 animate-pulse" />
              </div>
              <div className="h-4 w-16 rounded bg-foreground/10 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-sm font-medium text-foreground mb-1">No customers yet</p>
          <p className="text-xs text-muted-foreground mb-4">Add your first customer to track purchases</p>
          <Link href="/dashboard/customers" className="text-xs text-primary hover:underline">
            Add a customer →
          </Link>
        </div>
      )}

      {/* Real data */}
      {!isLoading && sorted.length > 0 && (
        <div className="space-y-1">
          {sorted.map((customer, idx) => {
            const tier = TIER_STYLE[idx] ?? TIER_STYLE[TIER_STYLE.length - 1]
            const name = `${customer.first_name} ${customer.last_name}`.trim()
            return (
              <div key={customer.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-dash-hover transition-colors">
                <span className="text-xs font-bold text-muted-foreground w-5 text-center shrink-0">{idx + 1}</span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                  style={{ background: tier.bg, border: `1px solid ${tier.color}40`, color: tier.color }}
                >
                  {name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{name}</p>
                  <p className="text-xs text-muted-foreground">{customer.total_orders} order{customer.total_orders !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {idx === 0 && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                  <span className="text-sm font-semibold text-foreground">{fmt(customer.total_purchases)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Link
        href="/dashboard/customers"
        className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dash-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-dash-hover transition-all"
      >
        View all customers <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}
