'use client'

// src/app/dashboard/page.tsx
import Sidebar           from '@/components/dashboard/Sidebar'
import DashboardHeader   from '@/components/dashboard/DashboardHeader'
import RevenueChart      from '@/components/dashboard/RevenueChart'
import OutstandingDebts  from '@/components/dashboard/OutstandingDebts'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import { useAuthStore }  from '@/stores/authStore'
import { useDashboard }  from '@/lib/hooks/useDashboard'
import { DollarSign, AlertTriangle, TrendingUp, Users, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({
  title, value, sub, icon: Icon, color, loading, href,
}: {
  title:   string
  value:   string
  sub?:    string
  icon:    React.ElementType
  color:   string
  loading: boolean
  href?:   string
}) {
  const inner = (
    <div className={cn(
      'rounded-2xl border border-white/8 bg-white/2 p-5 flex flex-col gap-3',
      href && 'hover:bg-white/[0.04] transition-colors cursor-pointer'
    )}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center border', color)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-8 w-28 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
          {sub && <p className="text-xs text-gray-500">{sub}</p>}
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
    <div className="bg-white/[0.02] border border-white/8 rounded-xl p-4 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
      {sub && <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore()
  const dash     = useDashboard()
  const firstName = user?.first_name || 'Oga'

  function fmt(n: number) {
    if (n >= 1_000_000) return `₦${(n/1_000_000).toFixed(1)}M`
    if (n >= 1_000)     return `₦${(n/1_000).toFixed(0)}k`
    return `₦${n.toLocaleString('en-NG')}`
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <Sidebar />

      <div className="lg:pl-72">
        <DashboardHeader />

        <main className="p-6 lg:p-10 space-y-8 pb-20">

          {/* Greeting */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Good morning, Oga {firstName} 👋
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Here's what's happening with your business today ·{' '}
              {new Date().toLocaleDateString('en-NG', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="TODAY'S SALES"
              value={fmt(dash.todaySalesTotal * 100)}
              sub={`${dash.todaySalesCount} transaction${dash.todaySalesCount !== 1 ? 's' : ''}`}
              icon={DollarSign}
              color="bg-primary/10 border-primary/20 text-primary"
              loading={dash.isLoading}
              href="/dashboard/sales"
            />
            <KPICard
              title="CUSTOMERS OWE YOU"
              value={fmt(dash.outstandingDebtTotal * 100)}
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
              value={fmt(dash.todayRevenue * 100)}
              sub="today (amount paid)"
              icon={TrendingUp}
              color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              loading={dash.isLoading}
            />
          </div>

          {/* Sales breakdown mini row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SalesMini
              label="Revenue Collected"
              value={`₦${(dash.todayRevenue).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
            />
            <SalesMini
              label="Transactions"
              value={String(dash.todaySalesCount)}
            />
            <SalesMini
              label="Fully Paid"
              value={String(dash.todayFullyPaid)}
            />
            <SalesMini
              label="Partial / Unpaid"
              value={String(dash.todayPartial)}
            />
          </div>

          {/* Revenue chart + Outstanding Debts */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-5">
            <div className="lg:col-span-4 min-h-[320px]">
              <RevenueChart />
            </div>
            <div className="lg:col-span-3">
              <OutstandingDebts
                debts={dash.overdueDebts}
                isLoading={dash.isLoading}
              />
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <RecentTransactions />
          </div>

        </main>
      </div>
    </div>
  )
}