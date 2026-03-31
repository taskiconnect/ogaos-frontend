'use client'

export const dynamic = 'force-dynamic'

// src/app/dashboard/page.tsx
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import RevenueChart from '@/components/dashboard/RevenueChart'
import OutstandingDebts from '@/components/dashboard/OutstandingDebts'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import { useAuthStore } from '@/stores/authStore'
import { useDashboard } from '@/lib/hooks/useDashboard'
import { DollarSign, AlertTriangle, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ─── Helper: Time-based greeting ─────────────────────────────────────────────

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours()

  if (hour < 12) {
    return 'Good morning'
  } else if (hour < 17) {
    return 'Good afternoon'
  } else {
    return 'Good evening'
  }
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({
  title,
  value,
  sub,
  icon: Icon,
  color,
  loading,
  href,
}: {
  title: string
  value: string
  sub?: string
  icon: React.ElementType
  color: string
  loading: boolean
  href?: string
}) {
  const inner = (
    <div
      className={cn(
        'rounded-2xl border border-white/8 bg-white/2 p-4 sm:p-5 flex flex-col gap-3',
        href && 'hover:bg-white/4 transition-colors cursor-pointer'
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </p>
        <div className={cn('w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border', color)}>
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-6 sm:h-8 w-20 sm:w-28 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-2 sm:h-3 w-16 sm:w-20 bg-white/5 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <p className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">{value}</p>
          {sub && <p className="text-[10px] sm:text-xs text-gray-500 truncate">{sub}</p>}
        </>
      )}
    </div>
  )

  if (href) return <Link href={href}>{inner}</Link>
  return inner
}

// ─── Sales mini stats ─────────────────────────────────────────────────────────

function SalesMini({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white/2 border border-white/8 rounded-xl p-3 sm:p-4 text-center">
      <p className="text-[10px] sm:text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-base sm:text-lg font-bold text-white truncate">{value}</p>
      {sub && <p className="text-[9px] sm:text-[10px] text-gray-600 mt-0.5 truncate">{sub}</p>}
    </div>
  )
}

// ─── Money formatting ─────────────────────────────────────────────────────────

function formatMoney(value: number, options?: { decimals?: number }) {
  const decimals = options?.decimals ?? 0

  // Only shorten billions and above
  if (value >= 1_000_000_000) {
    return `₦${(value / 1_000_000_000).toFixed(1)}B`
  }

  return `₦${value.toLocaleString('en-NG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore()
  const dash = useDashboard()
  const firstName = user?.first_name || 'Oga'

  return (
    <div className="min-h-screen bg-background text-white">
      <Sidebar />

      <div className="lg:pl-72">
        <DashboardHeader />

        <main className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 pb-20">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              {getTimeBasedGreeting()}, Oga {firstName} 👋
            </h1>
            <p className="text-gray-400 mt-1 text-xs sm:text-sm">
              Here&apos;s what&apos;s happening with your business today ·{' '}
              {new Date().toLocaleDateString('en-NG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <KPICard
              title="TODAY'S SALES"
              value={formatMoney(dash.todaySalesTotal, { decimals: 2 })}
              sub={`${dash.todaySalesCount} transaction${dash.todaySalesCount !== 1 ? 's' : ''}`}
              icon={DollarSign}
              color="bg-primary/10 border-primary/20 text-primary"
              loading={dash.isLoading}
              href="/dashboard/sales"
            />
            <KPICard
              title="CUSTOMERS OWE YOU"
              value={formatMoney(dash.outstandingDebtTotal, { decimals: 2 })}
              sub={dash.outstandingDebtTotal === 0 ? 'All paid up' : `${dash.outstandingDebtCount} unpaid`}
              icon={AlertTriangle}
              color="bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
              loading={dash.isLoading}
              href="/dashboard/debts"
            />
            <KPICard
              title="TOTAL CUSTOMERS"
              value={String(dash.totalCustomers)}
              sub="active customers"
              icon={Users}
              color="bg-blue-500/10 border-blue-500/20 text-blue-400"
              loading={dash.isLoading}
              href="/dashboard/customers"
            />
            <KPICard
              title="REVENUE COLLECTED"
              value={formatMoney(dash.todayRevenue, { decimals: 2 })}
              sub="today (amount paid)"
              icon={TrendingUp}
              color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              loading={dash.isLoading}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <SalesMini
              label="Today's Revenue"
              value={formatMoney(dash.todayRevenue, { decimals: 2 })}
            />
            <SalesMini
              label="Today's Transactions"
              value={String(dash.todaySalesCount)}
            />
            <SalesMini
              label="Today's Fully Paid"
              value={String(dash.todayFullyPaid)}
            />
            <SalesMini
              label="Today's Partial / Unpaid"
              value={String(dash.todayPartial)}
              sub={
                dash.todayPartial > 0 && dash.todayOutstanding > 0
                  ? `${formatMoney(dash.todayOutstanding, { decimals: 2 })} outstanding`
                  : undefined
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-7 gap-5">
            <div className="lg:col-span-4 min-h-80">
              <RevenueChart />
            </div>
            <div className="lg:col-span-3">
              <OutstandingDebts debts={dash.overdueDebts} isLoading={dash.isLoading} />
            </div>
          </div>

          <div>
            <RecentTransactions />
          </div>
        </main>
      </div>
    </div>
  )
}