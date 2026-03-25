'use client'

import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { listSales } from '@/lib/api/finance'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import RecordSaleModal from '@/components/sales/RecordSaleModal'
import SaleDetailDrawer from '@/components/sales/SaleDetailDrawer'
import ReceiptModal from '@/components/sales/ReceiptModal'
import {
  Plus, Search, TrendingUp, ShoppingCart,
  DollarSign, Clock, ChevronDown, Receipt, Printer,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Sale } from '@/lib/api/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

// All API values are kobo → display in naira
function fmt(kobo: number) {
  const n = kobo / 100
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `₦${(n / 1_000).toFixed(0)}k`
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(iso))
}
function fmtTime(iso: string) {
  return new Intl.DateTimeFormat('en-NG', { hour: '2-digit', minute: '2-digit' })
    .format(new Date(iso))
}

function custName(sale: Sale) {
  if (sale.customer) return `${sale.customer.first_name} ${sale.customer.last_name}`.trim()
  return 'Walk-in'
}

function itemSummary(sale: Sale) {
  if (!sale.items?.length) return sale.payment_method
  const first = sale.items[0].product_name
  return sale.items.length > 1 ? `${first} +${sale.items.length - 1}` : first
}

const STATUS_MAP = {
  completed: { label: 'Paid',      cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  partial:   { label: 'Partial',   cls: 'bg-yellow-500/10  text-yellow-600  dark:text-yellow-400  border-yellow-500/20'  },
  pending:   { label: 'Unpaid',    cls: 'bg-orange-500/10  text-orange-600  dark:text-orange-400  border-orange-500/20'  },
  cancelled: { label: 'Cancelled', cls: 'bg-red-500/10     text-red-600     dark:text-red-400     border-red-500/20'     },
} as const

const STATUS_FILTERS = [
  { label: 'All',       value: '' },
  { label: 'Paid',      value: 'completed' },
  { label: 'Partial',   value: 'partial' },
  { label: 'Unpaid',    value: 'pending' },
  { label: 'Cancelled', value: 'cancelled' },
]

const DATE_OPTIONS = [
  { label: 'All time',   value: '' },
  { label: 'Today',      value: 'today' },
  { label: 'This week',  value: 'week' },
  { label: 'This month', value: 'month' },
]

function dateRange(v: string): { date_from?: string; date_to?: string } {
  const d  = new Date()
  const p  = (n: number) => String(n).padStart(2, '0')
  const fd = (x: Date) => `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}`
  if (v === 'today')  { const t = fd(d); return { date_from: t, date_to: t } }
  if (v === 'week')   { const s = new Date(d); s.setDate(d.getDate() - d.getDay()); return { date_from: fd(s), date_to: fd(d) } }
  if (v === 'month')  { return { date_from: fd(new Date(d.getFullYear(), d.getMonth(), 1)), date_to: fd(d) } }
  return {}
}

// ─── Stat card (FIXED: added truncation and responsive text sizing) ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string
}) {
  return (
    <div className="bg-dash-surface border border-dash-border rounded-2xl p-5 flex items-center gap-4 min-w-0">
      <div className={cn('w-11 h-11 rounded-xl border flex items-center justify-center shrink-0', color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-none truncate">
          {value}
        </p>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
          {label}
        </p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SalesPage() {
  const [showModal,    setShowModal]    = useState(false)
  const [selectedId,  setSelectedId]   = useState<string | null>(null)
  const [receiptSale, setReceiptSale]  = useState<Sale | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [rangeFilter,  setRangeFilter]  = useState('')
  const [search,       setSearch]       = useState('')

  const rangeParams = dateRange(rangeFilter)

  const {
    data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch,
  } = useInfiniteQuery({
    queryKey: ['sales', statusFilter, rangeFilter],
    queryFn: ({ pageParam }) => listSales({
      status:    statusFilter || undefined,
      limit:     30,
      cursor:    pageParam as string | undefined,
      ...rangeParams,
    }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: last => last.next_cursor ?? undefined,
  })

  // Flatten all pages
  const allSales = data?.pages.flatMap(p => p.data) ?? []

  // Client-side search filter
  const filtered = search
    ? allSales.filter(s =>
        custName(s).toLowerCase().includes(search.toLowerCase()) ||
        s.sale_number.toLowerCase().includes(search.toLowerCase()) ||
        (s.staff_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        itemSummary(s).toLowerCase().includes(search.toLowerCase()),
      )
    : allSales

  // ── Stats — all in kobo from API, fmt() converts to naira ────────────────
  const revenueKobo  = allSales
    .filter(s => s.status !== 'cancelled')
    .reduce((sum, s) => sum + s.amount_paid, 0)

  const completedCt  = allSales.filter(s => s.status === 'completed').length
  const partialCt    = allSales.filter(s => s.status === 'partial' || s.status === 'pending').length
  const outstandingK = allSales
    .filter(s => s.status === 'partial' || s.status === 'pending')
    .reduce((sum, s) => sum + s.balance_due, 0)

  return (
    <div className="min-h-screen bg-dash-bg text-foreground">
      <Sidebar />
      <div className="lg:pl-72">
        <DashboardHeader />
        <main className="p-6 lg:p-10 space-y-8 pb-24">

          {/* Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Sales</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Record and track all your sales transactions
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm shadow-lg transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
            >
              <Plus className="w-4 h-4" /> Record Sale
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={DollarSign}   label="Revenue Collected" value={fmt(revenueKobo)}
              color="bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
            />
            <StatCard
              icon={ShoppingCart} label="Transactions"       value={String(allSales.length)}
              color="bg-blue-500/10 border-blue-500/20 text-blue-500"
            />
            <StatCard
              icon={TrendingUp}   label="Fully Paid"         value={String(completedCt)}
              color="bg-primary/10 border-primary/20 text-primary"
            />
            <StatCard
              icon={Clock}        label="Partial / Unpaid"   value={String(partialCt)}
              sub={outstandingK > 0 ? `${fmt(outstandingK)} outstanding` : undefined}
              color="bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search customer, sale #, item, staff…"
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-dash-surface border border-dash-border text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={cn(
                    'px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all',
                    statusFilter === f.value
                      ? 'bg-primary text-white border-primary'
                      : 'bg-dash-surface border-dash-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <select
                value={rangeFilter}
                onChange={e => setRangeFilter(e.target.value)}
                className="h-10 pl-3 pr-8 rounded-xl bg-dash-surface border border-dash-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
              >
                {DATE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Table */}
          <div className="bg-dash-surface border border-dash-border rounded-3xl overflow-hidden">

            {/* Desktop column headers */}
            <div className="hidden sm:grid grid-cols-[1fr_1fr_130px_150px_110px_48px] gap-4 px-6 py-3 border-b border-dash-border bg-dash-bg">
              {['Customer', 'Items / Staff', 'Amount', 'Date & Time', 'Status', ''].map((h, i) => (
                <span key={i} className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {h}
                </span>
              ))}
            </div>

            {/* Loading skeletons */}
            {isLoading && (
              <div className="divide-y divide-dash-border">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                    <div className="h-4 bg-dash-bg rounded w-28" />
                    <div className="h-4 bg-dash-bg rounded flex-1" />
                    <div className="h-4 bg-dash-bg rounded w-20" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-dash-bg border border-dash-border flex items-center justify-center mb-4">
                  <Receipt className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="font-semibold text-foreground mb-1">No sales found</p>
                <p className="text-sm text-muted-foreground mb-6">
                  {search || statusFilter ? 'Try adjusting your filters' : 'Record your first sale to get started'}
                </p>
                {!search && !statusFilter && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm"
                    style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
                  >
                    <Plus className="w-4 h-4" /> Record Sale
                  </button>
                )}
              </div>
            )}

            {/* Rows */}
            {!isLoading && filtered.length > 0 && (
              <div className="divide-y divide-dash-border">
                {filtered.map(sale => {
                  const sc = STATUS_MAP[sale.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.partial
                  return (
                    <div key={sale.id} className="group hover:bg-dash-hover/50 transition-colors">

                      {/* Mobile row */}
                      <div className="sm:hidden flex items-center gap-3 px-4 py-4">
                        <button className="flex-1 text-left min-w-0" onClick={() => setSelectedId(sale.id)}>
                          <p className="font-semibold text-foreground text-sm truncate">{custName(sale)}</p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{itemSummary(sale)}</p>
                        </button>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-foreground text-sm">{fmt(sale.total_amount)}</p>
                          {sale.balance_due > 0 && (
                            <p className="text-[10px] text-yellow-600 dark:text-yellow-400">
                              Bal: {fmt(sale.balance_due)}
                            </p>
                          )}
                          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-0.5 inline-block', sc.cls)}>
                            {sc.label}
                          </span>
                        </div>
                        <button
                          onClick={() => setReceiptSale(sale)}
                          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-dash-hover transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Desktop row */}
                      <div className="hidden sm:grid grid-cols-[1fr_1fr_130px_150px_110px_48px] gap-4 items-center px-6 py-4">
                        {/* Customer */}
                        <button className="text-left min-w-0" onClick={() => setSelectedId(sale.id)}>
                          <p className="font-semibold text-foreground text-sm truncate">{custName(sale)}</p>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{sale.sale_number}</p>
                        </button>
                        {/* Items / staff */}
                        <button className="text-left min-w-0" onClick={() => setSelectedId(sale.id)}>
                          <p className="text-sm text-muted-foreground truncate">{itemSummary(sale)}</p>
                          {sale.staff_name && (
                            <p className="text-xs text-muted-foreground/60 truncate mt-0.5">
                              👤 {sale.staff_name}
                            </p>
                          )}
                        </button>
                        {/* Amount */}
                        <button className="text-left" onClick={() => setSelectedId(sale.id)}>
                          <p className="font-semibold text-foreground text-sm">{fmt(sale.total_amount)}</p>
                          {sale.balance_due > 0 && (
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">
                              Bal: {fmt(sale.balance_due)}
                            </p>
                          )}
                        </button>
                        {/* Date */}
                        <button className="text-left" onClick={() => setSelectedId(sale.id)}>
                          <p className="text-sm text-foreground">{fmtDate(sale.created_at)}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{fmtTime(sale.created_at)}</p>
                        </button>
                        {/* Status */}
                        <button onClick={() => setSelectedId(sale.id)}>
                          <span className={cn('inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full border', sc.cls)}>
                            {sc.label}
                          </span>
                        </button>
                        {/* Receipt icon – visible on hover */}
                        <button
                          onClick={() => setReceiptSale(sale)}
                          title="Receipt"
                          className="opacity-0 group-hover:opacity-100 w-9 h-9 flex items-center justify-center rounded-xl border border-dash-border hover:bg-dash-hover text-muted-foreground hover:text-foreground transition-all"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Load more */}
            {hasNextPage && (
              <div className="px-6 py-4 border-t border-dash-border">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground border border-dash-border hover:border-foreground/20 transition-colors disabled:opacity-50"
                >
                  {isFetchingNextPage ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Modals */}
      <RecordSaleModal
        open={showModal}
        onOpenChange={setShowModal}
        onSuccess={refetch}
      />
      <SaleDetailDrawer
        saleId={selectedId}
        onClose={() => setSelectedId(null)}
        onPrintReceipt={sale => { setSelectedId(null); setReceiptSale(sale) }}
      />
      <ReceiptModal
        sale={receiptSale}
        onClose={() => setReceiptSale(null)}
      />
    </div>
  )
}