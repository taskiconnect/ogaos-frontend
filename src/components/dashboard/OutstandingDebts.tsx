'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import type { Debt } from '@/lib/api/types'

function fmt(kobo: number) {
  const n = Math.round(kobo / 100)

  if (n >= 1_000_000_000) {
    return `₦${(n / 1_000_000_000).toFixed(1)}B`
  }

  return `₦${n.toLocaleString('en-NG')}`
}

function daysOverdue(dueDateStr: string | null): number {
  if (!dueDateStr) return 0
  const diff = Date.now() - new Date(dueDateStr).getTime()
  return Math.max(0, Math.floor(diff / 86400000))
}

function urgencyColor(days: number) {
  if (days >= 21) return 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20'
  if (days >= 7) return 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20'
  return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
}

function partyName(debt: Debt): string {
  if (debt.customer) {
    return `${debt.customer.first_name} ${debt.customer.last_name}`.trim()
  }
  return debt.supplier_name ?? 'Unknown'
}

interface Props {
  debts: Debt[]
  isLoading: boolean
}

export default function OutstandingDebts({ debts, isLoading }: Props) {
  // Only show receivables that are still open
  const openDebts = debts.filter(
    (debt) =>
      debt.direction === 'receivable' &&
      debt.status !== 'settled' &&
      debt.amount_due > 0
  )

  const total = openDebts.reduce((sum, debt) => sum + (debt.amount_due ?? 0), 0)
  const overdueCount = openDebts.filter((debt) => daysOverdue(debt.due_date) > 0).length

  return (
    <div className="rounded-2xl border border-dash-border bg-dash-surface p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-orange-500 dark:text-orange-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-sm">Outstanding Debts</h3>
            <p className="text-[11px] text-muted-foreground">
              {isLoading
                ? '…'
                : openDebts.length === 0
                  ? 'No unpaid debts'
                  : overdueCount > 0
                    ? `${openDebts.length} unpaid · ${overdueCount} overdue`
                    : `${openDebts.length} unpaid`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="h-5 w-20 rounded bg-foreground/10 animate-pulse" />
        ) : (
          <p className="text-lg font-bold text-red-600 dark:text-red-400 break-words text-right">
            {fmt(total)}
          </p>
        )}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-2 flex-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-foreground/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && openDebts.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
          <p className="text-sm font-medium text-foreground mb-1">All clear!</p>
          <p className="text-xs text-muted-foreground">No outstanding debts right now</p>
        </div>
      )}

      {/* Real data */}
      {!isLoading && openDebts.length > 0 && (
        <div className="space-y-2 flex-1">
          {openDebts.map((debt) => {
            const days = daysOverdue(debt.due_date)
            const name = partyName(debt)

            return (
              <div
                key={debt.id}
                className="flex items-center justify-between py-3 px-3 rounded-xl bg-dash-subtle border border-dash-border hover:bg-dash-hover transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
                  >
                    {name[0]?.toUpperCase() ?? '?'}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{name}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-muted-foreground capitalize">{debt.status}</span>
                      <span className="text-[10px] text-muted-foreground capitalize">{debt.direction}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  {days > 0 && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgencyColor(days)}`}>
                      {days}d
                    </span>
                  )}
                  <span className="text-sm font-semibold text-foreground">{fmt(debt.amount_due)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer */}
      <Link
        href="/dashboard/debts"
        className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dash-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-dash-hover transition-all"
      >
        View all debts <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}