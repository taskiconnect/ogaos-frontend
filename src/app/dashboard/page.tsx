'use client'
import { useBusinessOverview } from '@/features/dashboard/useBusinessOverview'
import { money } from '@/lib/domain/money'
import { useAuthStore } from '@/stores/authStore'
import {
  ArrowRight,
  ArrowUpRight,
  CircleHelp,
  Package,
  Plus,
  Receipt,
  RefreshCw,
  ShoppingBag,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const overview = useBusinessOverview()
  const grouped = new Map<string, number>()
  for (const sale of overview.sales) {
    const day = new Date(sale.created_at).toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' })
    grouped.set(day, (grouped.get(day) ?? 0) + sale.amount_paid)
  }
  const chart = [...grouped]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, paid]) => ({ day: day.slice(8), paid: paid / 100 }))
  const stats = [
    {
      label: 'Paid on this month’s sales',
      value: money(overview.paid),
      hint: 'Payments attached to sales created this month',
      icon: Wallet,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'This month’s sales value',
      value: money(overview.billed),
      hint: `${overview.sales.length} recorded transactions`,
      icon: ShoppingBag,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
    {
      label: 'Outstanding sales balances',
      value: money(overview.outstanding),
      hint: `${overview.pending.length} sales awaiting full payment`,
      icon: Receipt,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ]
  return (
    <main className="mx-auto max-w-[1600px] space-y-7 p-5 pb-24 sm:p-8 lg:p-10">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-blue-400">
            Your business, at a glance
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome back, {user?.first_name || 'Oga'}.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            A clearer view of your sales and the work ahead.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            aria-label="Refresh overview"
            onClick={() => {
              void overview.monthly.refetch()
              void overview.partial.refetch()
            }}
            className="rounded-xl border border-border p-3 hover:bg-muted"
          >
            <RefreshCw className="size-4" />
          </button>
          <Link
            href="/dashboard/sales?new=1"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
          >
            <Plus className="size-4" />
            Record a sale
          </Link>
        </div>
      </header>
      {overview.error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
        >
          Some records could not be loaded. Figures are unavailable until the connection is
          restored. Use refresh to try again.
        </div>
      )}
      {!overview.complete && (
        <p role="status" className="rounded-xl bg-amber-500/10 p-4 text-sm text-amber-300">
          This overview reached its record limit. The figures below are partial; a backend summary
          endpoint is needed for larger datasets.
        </p>
      )}
      <section aria-label="Business overview" className="grid gap-4 xl:grid-cols-3">
        {stats.map(({ label, value, hint, icon: Icon, color, bg }) => (
          <article key={label} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <span className={`rounded-xl p-2.5 ${bg} ${color}`}>
                <Icon className="size-5" />
              </span>
            </div>
            <p className="mt-6 text-3xl font-semibold tracking-tight">
              {overview.loading
                ? '—'
                : overview.error
                  ? 'Unavailable'
                  : `${!overview.complete ? '≥ ' : ''}${value}`}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
          </article>
        ))}
      </section>
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <section className="min-w-0 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold">Sales payment overview</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Current month · grouped by sale date
              </p>
            </div>
            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">NGN</span>
          </div>
          <div className="mt-7 h-64">
            {!overview.loading && !overview.error && chart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={65} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                    }}
                    formatter={(v) => [money(Number(v) * 100), 'Paid']}
                  />
                  <Area
                    type="monotone"
                    dataKey="paid"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#revenueFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                {overview.loading
                  ? 'Loading sales…'
                  : overview.error
                    ? 'Chart unavailable'
                    : 'Your sales will appear here.'}
              </div>
            )}
          </div>
          <p className="mt-4 flex gap-2 text-xs leading-5 text-muted-foreground">
            <CircleHelp className="mt-0.5 size-4 shrink-0" />
            Repayments stay attached to their original sale. This is a sales snapshot, not a
            cash-receipts ledger.
          </p>
        </section>
        <aside className="rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-600/20 via-card to-violet-600/10 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
            Move your business forward
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">
            Everything starts with one good record.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Keep sales up to date, share professional documents, and stay on top of outstanding
            payments.
          </p>
          <div className="mt-7 space-y-2">
            {[
              { href: '/dashboard/products', label: 'Manage products', icon: Package },
              { href: '/dashboard/invoices', label: 'Prepare an invoice', icon: Receipt },
              { href: '/dashboard/subscription', label: 'Explore your plan', icon: ArrowUpRight },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-4 py-3 text-sm hover:bg-muted"
              >
                <span className="flex gap-2">
                  <Icon className="size-4 text-blue-400" />
                  {label}
                </span>
                <ArrowRight className="size-4" />
              </Link>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Your dashboard is available on every plan.
          </p>
        </aside>
      </div>
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-semibold">Recent sales this month</h2>
          <Link href="/dashboard/sales" className="text-sm font-medium text-blue-400">
            View all sales →
          </Link>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                {['Sale', 'Customer', 'Status', 'Sale value', 'Balance'].map((t) => (
                  <th key={t} className="whitespace-nowrap px-6 py-4 font-medium">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!overview.error &&
                overview.sales.slice(0, 8).map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="px-6 py-4 font-medium">{s.sale_number}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {s.customer
                        ? `${s.customer.first_name} ${s.customer.last_name}`
                        : 'Walk-in customer'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${s.balance_due ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}
                      >
                        {s.balance_due ? 'Partial' : 'Paid'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{money(s.total_amount)}</td>
                    <td className="px-6 py-4">{money(s.balance_due)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!overview.loading && !overview.sales.length && (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            {overview.error ? 'Sales could not be loaded.' : 'No sales recorded this month.'}
          </p>
        )}
      </section>
    </main>
  )
}
