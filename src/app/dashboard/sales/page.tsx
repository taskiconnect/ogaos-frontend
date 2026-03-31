'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listSales, cancelSale, getSalesSummary } from '@/lib/api/finance'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import {
  Plus, Search, ShoppingBag, ChevronDown,
  ShoppingCart, TrendingUp, Users, CreditCard, Receipt, XCircle, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Sale } from '@/lib/api/types'
import RecordSaleModal from '@/components/sales/RecordSaleModal'
import SaleDetailDrawer from '@/components/sales/SaleDetailDrawer'
import ReceiptModal from '@/components/sales/ReceiptModal'
import { toast } from 'sonner'

function formatMoney(kobo: number, options?: { compactFromBillions?: boolean; decimals?: number }) {
  const n = kobo / 100
  const decimals = options?.decimals ?? 2
  const compactFromBillions = options?.compactFromBillions ?? true

  if (compactFromBillions && n >= 1_000_000_000) {
    return `₦${(n / 1_000_000_000).toFixed(1)}B`
  }

  return `₦${n.toLocaleString('en-NG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

function getAmountTextClass(value: string) {
  if (value.length >= 18) return 'text-base sm:text-lg'
  if (value.length >= 14) return 'text-lg sm:text-xl'
  return 'text-2xl'
}

function getRowAmountTextClass(value: string) {
  if (value.length >= 18) return 'text-xs sm:text-sm'
  return 'text-sm'
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub,
  icon: Icon, iconColor, iconBg, valueColor,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  valueColor?: string
}) {
  return (
    <div className="relative bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl p-5 overflow-hidden">
      <div className={cn('absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center', iconBg)}>
        <Icon className={cn('w-3.5 h-3.5', iconColor)} />
      </div>

      <div className="pr-10 min-w-0">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
        <p
          className={cn(
            'font-bold leading-tight break-words',
            getAmountTextClass(value),
            valueColor ?? 'text-white'
          )}
        >
          {value}
        </p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Cancel Confirmation Modal ────────────────────────────────────────────────
function CancelModal({
  sale,
  onConfirm,
  onClose,
  isPending,
}: {
  sale: Sale
  onConfirm: (reason: string) => void
  onClose: () => void
  isPending: boolean
}) {
  const [reason, setReason] = useState('')

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-dash-surface border border-dash-border rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Cancel Sale</h3>
              <p className="text-xs text-muted-foreground">{sale.sale_number}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg hover:bg-dash-hover text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          This sale will be marked as <span className="font-semibold text-red-400">cancelled</span> and excluded
          from revenue and totals. Stock, customer stats, and any linked debt will be automatically reversed.
          The record stays visible for your audit trail.
        </p>

        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
            Reason (optional)
          </label>
          <input
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Customer returned item, duplicate entry…"
            className="w-full h-10 rounded-xl bg-dash-bg border border-dash-border px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-red-500/30"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors"
          >
            Keep Sale
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={isPending}
            className="flex-1 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-sm font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Cancelling…' : 'Yes, Cancel Sale'}
          </button>
        </div>
      </div>
    </div>
  )
}

const STATUS_CLS: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  partial: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const PAYMENT_METHODS = ['cash', 'transfer', 'pos', 'card', 'cheque', 'credit']

export default function SalesPage() {
  const qc = useQueryClient()
  const now = new Date()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [dateOpt, setDateOpt] = useState('month')
  const [showRecord, setShowRecord] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<Sale | null>(null)
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null)
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null)

  function dateRange(v: string) {
    const d = new Date()
    const p = (n: number) => String(n).padStart(2, '0')
    const fd = (x: Date) => `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}`

    if (v === 'today') {
      const t = fd(d)
      return { date_from: t, date_to: t }
    }
    if (v === 'week') {
      const s = new Date(d)
      s.setDate(d.getDate() - d.getDay())
      return { date_from: fd(s), date_to: fd(d) }
    }
    if (v === 'month') {
      return { date_from: fd(new Date(d.getFullYear(), d.getMonth(), 1)), date_to: fd(d) }
    }
    if (v === 'year') {
      return { date_from: `${d.getFullYear()}-01-01`, date_to: fd(d) }
    }

    return {}
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['sales', statusFilter, methodFilter, dateOpt],
    queryFn: ({ pageParam }) =>
      listSales({
        limit: 30,
        cursor: pageParam as string | undefined,
        status: statusFilter || undefined,
        ...dateRange(dateOpt),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: any) => last.next_cursor ?? undefined,
  })

  const { data: summary } = useQuery({
    queryKey: ['sales-summary', now.getFullYear(), now.getMonth() + 1],
    queryFn: () => getSalesSummary(now.getFullYear(), now.getMonth() + 1),
  })

  const allSales: Sale[] = useMemo(
    () => (data?.pages ?? []).flatMap((p: any) => p.data ?? []),
    [data]
  )

  const filtered = useMemo(() => {
    let list = allSales

    if (methodFilter) list = list.filter(s => s.payment_method === methodFilter)

    if (!search.trim()) return list

    const q = search.toLowerCase()
    return list.filter(s =>
      s.sale_number.toLowerCase().includes(q) ||
      (s.customer?.first_name ?? '').toLowerCase().includes(q) ||
      (s.customer?.last_name ?? '').toLowerCase().includes(q)
    )
  }, [allSales, search, methodFilter])

  const cancelMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelSale(id, reason),
    onSuccess: () => {
      toast.success('Sale cancelled and reversed.')
      qc.invalidateQueries({ queryKey: ['sales'] })
      qc.invalidateQueries({ queryKey: ['sales-summary'] })
      qc.invalidateQueries({ queryKey: ['customers'] })
      setCancelTarget(null)
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to cancel sale'),
  })

  const totalRevenue = summary?.total_revenue ?? 0
  const totalSales = summary?.total_sales ?? 0
  const totalCustomers = summary?.unique_customers ?? 0
  const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0

  const revenueText = formatMoney(totalRevenue)
  const avgSaleText = formatMoney(avgSale)

  const DATE_OPTS = [
    { label: 'Today', value: 'today' },
    { label: 'This week', value: 'week' },
    { label: 'This month', value: 'month' },
    { label: 'This year', value: 'year' },
    { label: 'All time', value: '' },
  ]

  return (
    <div className="min-h-screen bg-background text-white">
      <Sidebar />
      <div className="lg:pl-72">
        <DashboardHeader />

        <main className="p-6 lg:p-10 space-y-8 pb-20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
              <p className="text-gray-400 mt-1 text-sm">Track revenue and transactions</p>
            </div>

            <button
              onClick={() => setShowRecord(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
            >
              <Plus className="w-4 h-4" /> Record Sale
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Revenue Collected"
              value={revenueText}
              sub={now.toLocaleString('en-NG', { month: 'long' })}
              icon={TrendingUp}
              iconBg="bg-emerald-500/10"
              iconColor="text-emerald-400"
              valueColor="text-emerald-400"
            />
            <StatCard
              label="Transactions"
              value={String(totalSales)}
              sub="sales this period"
              icon={Receipt}
              iconBg="bg-blue-500/10"
              iconColor="text-blue-400"
              valueColor="text-white"
            />
            <StatCard
              label="Unique Customers"
              value={String(totalCustomers)}
              sub="buyers this period"
              icon={Users}
              iconBg="bg-purple-500/10"
              iconColor="text-purple-400"
              valueColor="text-purple-400"
            />
            <StatCard
              label="Avg. Sale Value"
              value={avgSaleText}
              sub="per transaction"
              icon={CreditCard}
              iconBg="bg-yellow-500/10"
              iconColor="text-yellow-400"
              valueColor="text-yellow-400"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search sale # or customer…"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {(['', 'completed', 'partial', 'cancelled'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    'px-3 py-2 rounded-xl text-xs font-semibold border uppercase transition-all',
                    statusFilter === s
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  )}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>

            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none"
            >
              <option value="">All methods</option>
              {PAYMENT_METHODS.map(m => (
                <option key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={dateOpt}
              onChange={e => setDateOpt(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none"
            >
              {DATE_OPTS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="p-10 text-center text-gray-500 text-sm">Loading sales…</div>
            ) : filtered.length === 0 ? (
              <div className="p-16 flex flex-col items-center text-center">
                <ShoppingCart className="w-10 h-10 text-gray-600 mb-3" />
                <p className="text-gray-400 font-medium">No sales found</p>
                <p className="text-gray-600 text-sm mt-1">Record your first sale to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filtered.map(sale => {
                  const isCancelled = sale.status === 'cancelled'
                  const totalAmountText = formatMoney(sale.total_amount)
                  const balanceDueText = formatMoney(sale.balance_due)

                  return (
                    <div
                      key={sale.id}
                      className={cn(
                        'flex items-center gap-4 px-5 py-4 transition-colors',
                        isCancelled ? 'opacity-50' : 'hover:bg-white/[0.02] cursor-pointer'
                      )}
                      onClick={() => {
                        if (!isCancelled) setSelectedSaleId(sale.id)
                      }}
                    >
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl border flex items-center justify-center shrink-0',
                          isCancelled ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/10'
                        )}
                      >
                        {isCancelled ? (
                          <XCircle className="w-4 h-4 text-red-400/60" />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm font-medium truncate',
                            isCancelled ? 'text-gray-500 line-through' : 'text-white'
                          )}
                        >
                          {sale.customer
                            ? `${sale.customer.first_name} ${sale.customer.last_name}`
                            : 'Walk-in customer'}
                        </p>

                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span
                            className={cn(
                              'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border',
                              STATUS_CLS[sale.status] ?? STATUS_CLS.completed
                            )}
                          >
                            {sale.status}
                          </span>
                          <span className="text-xs text-gray-500">{sale.sale_number}</span>
                          <span className="text-xs text-gray-500 capitalize">{sale.payment_method}</span>
                          <span className="text-xs text-gray-600">{fmtDate(sale.created_at)}</span>
                        </div>

                        {isCancelled && sale.notes && (
                          <p className="text-[11px] text-red-400/70 mt-1 truncate italic">
                            Reason: {sale.notes.replace(/^Cancelled by staff \(user [^)]+\):\s*/i, '')}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0 max-w-[180px] sm:max-w-[220px]">
                        <p
                          className={cn(
                            'font-semibold leading-tight break-words',
                            getRowAmountTextClass(totalAmountText),
                            isCancelled ? 'text-gray-500 line-through' : 'text-white'
                          )}
                        >
                          {totalAmountText}
                        </p>

                        {sale.balance_due > 0 && !isCancelled && (
                          <p className="text-[10px] text-yellow-400 mt-0.5 break-words">
                            {balanceDueText} due
                          </p>
                        )}
                      </div>

                      {!isCancelled && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setCancelTarget(sale)
                          }}
                          title="Cancel this sale"
                          className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors shrink-0"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {hasNextPage && (
            <div className="text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10"
              >
                <ChevronDown className="w-4 h-4" />
                {isFetchingNextPage ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </main>
      </div>

      <RecordSaleModal
        open={showRecord}
        onOpenChange={setShowRecord}
        onSuccess={() => qc.invalidateQueries({ queryKey: ['sales'] })}
      />

      {cancelTarget && (
        <CancelModal
          sale={cancelTarget}
          onClose={() => setCancelTarget(null)}
          isPending={cancelMut.isPending}
          onConfirm={(reason) => cancelMut.mutate({ id: cancelTarget!.id, reason })}
        />
      )}

      <SaleDetailDrawer
        saleId={selectedSaleId}
        onClose={() => setSelectedSaleId(null)}
        onPrintReceipt={(sale) => {
          setSelectedSaleId(null)
          setReceiptSale(sale)
        }}
      />

      <ReceiptModal
        sale={receiptSale}
        onClose={() => setReceiptSale(null)}
      />
    </div>
  )
}