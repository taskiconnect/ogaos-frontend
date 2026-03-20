'use client'

// src/components/dashboard/RecentTransactions.tsx
import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { listSales } from '@/lib/api/finance'
import { cn } from '@/lib/utils'
import type { Sale } from '@/lib/api/types'

function fmt(kobo: number) {
  return `₦${Math.round(kobo / 100).toLocaleString('en-NG')}`
}
function timeAgo(iso: string) {
  const diff  = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days  = Math.floor(hours / 24)
  if (mins  <  1) return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const STATUS: Record<string, { label: string; cls: string }> = {
  completed: { label: 'Paid',      cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  partial:   { label: 'Partial',   cls: 'bg-yellow-500/10  text-yellow-400  border-yellow-500/20'  },
  cancelled: { label: 'Cancelled', cls: 'bg-red-500/10     text-red-400     border-red-500/20'     },
}

function customerName(sale: Sale): string {
  if (sale.customer) return `${sale.customer.first_name} ${sale.customer.last_name}`.trim()
  return 'Walk-in customer'
}

export default function RecentTransactions() {
  const { data, isLoading } = useQuery({
    queryKey: ['sales', 'recent-widget'],
    queryFn:  () => listSales({ limit: 6 }),
    staleTime: 1000 * 60 * 2,
  })

  const sales = data?.data ?? []

  return (
    <div className="rounded-2xl border border-white/8 bg-white/2 h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <h3 className="font-semibold text-white text-sm">Recent Transactions</h3>
        <Link href="/dashboard/sales"
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex-1 divide-y divide-white/5">
        {isLoading && (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-white/5 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-white/5 rounded w-32" />
                <div className="h-2.5 bg-white/5 rounded w-20" />
              </div>
              <div className="h-4 bg-white/5 rounded w-16" />
            </div>
          ))
        )}

        {!isLoading && sales.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <ShoppingBag className="w-8 h-8 text-gray-700 mb-2" />
            <p className="text-sm text-gray-500">No transactions yet</p>
            <p className="text-xs text-gray-600 mt-0.5">Record your first sale to see it here</p>
          </div>
        )}

        {!isLoading && sales.map((sale) => {
          const st = STATUS[sale.status] ?? STATUS.completed
          return (
            <div key={sale.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{customerName(sale)}</p>
                <p className="text-xs text-gray-500">{sale.sale_number} · {timeAgo(sale.created_at)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-white">{fmt(sale.total_amount)}</p>
                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', st.cls)}>
                  {st.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}