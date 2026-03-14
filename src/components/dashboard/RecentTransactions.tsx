'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Sale } from '@/lib/api/types'

// Kobo → formatted naira string
function fmt(kobo: number) {
  return `₦${Math.round(kobo / 100).toLocaleString('en-NG')}`
}

function customerName(sale: Sale): string {
  if (sale.customer) return `${sale.customer.first_name} ${sale.customer.last_name}`.trim()
  return 'Walk-in customer'
}

function itemSummary(sale: Sale): string {
  if (!sale.items?.length) return sale.payment_method
  const first = sale.items[0]
  return sale.items.length > 1
    ? `${first.product_name} + ${sale.items.length - 1} more`
    : first.product_name
}

const STATUS: Record<string, { label: string; cls: string }> = {
  completed: { label: 'Paid',      cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  partial:   { label: 'Partial',   cls: 'bg-yellow-500/10  text-yellow-600  dark:text-yellow-400  border-yellow-500/20'  },
  cancelled: { label: 'Cancelled', cls: 'bg-red-500/10     text-red-600     dark:text-red-400     border-red-500/20'     },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
  return `${Math.floor(hrs / 24)}d ago`
}

interface Props {
  sales:     Sale[]
  isLoading: boolean
}

export default function RecentTransactions({ sales, isLoading }: Props) {
  return (
    <div className="rounded-2xl border border-dash-border bg-dash-surface h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-dash-border">
        <h3 className="font-semibold text-foreground text-sm">Recent Transactions</h3>
        <Link href="/dashboard/sales" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="flex-1 divide-y divide-dash-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-8 h-8 rounded-full bg-foreground/10 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-28 rounded bg-foreground/10 animate-pulse" />
                <div className="h-2.5 w-20 rounded bg-foreground/10 animate-pulse" />
              </div>
              <div className="h-4 w-16 rounded bg-foreground/10 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && sales.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-6">
          <p className="text-sm font-medium text-foreground mb-1">No transactions yet</p>
          <p className="text-xs text-muted-foreground mb-4">Record your first sale to see it here</p>
          <Link href="/dashboard/sales" className="text-xs text-primary hover:underline">
            Record a sale →
          </Link>
        </div>
      )}

      {/* Real data */}
      {!isLoading && sales.length > 0 && (
        <div className="flex-1 divide-y divide-dash-border">
          {sales.map(tx => {
            const st = STATUS[tx.status] ?? STATUS.partial
            const name = customerName(tx)
            return (
              <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-dash-hover transition-colors">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
                >
                  {name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{name}</p>
                  <p className="text-xs text-muted-foreground truncate">{itemSummary(tx)}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-sm font-semibold text-foreground">{fmt(tx.total_amount)}</span>
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', st.cls)}>
                    {st.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
