'use client'

import { useQuery } from '@tanstack/react-query'
import { getSale } from '@/lib/api/finance'
import {
  X, Receipt, User, CreditCard, Package,
  CheckCircle2, Clock, XCircle, Printer, UserCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Sale } from '@/lib/api/types'

// All money from API is kobo → display as naira
function fmt(kobo: number) {
  return `₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

const STATUS_MAP = {
  completed: { label: 'Paid',      Icon: CheckCircle2, cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  partial:   { label: 'Partial',   Icon: Clock,        cls: 'bg-yellow-500/10  text-yellow-600  dark:text-yellow-400  border-yellow-500/20'  },
  pending:   { label: 'Unpaid',    Icon: Clock,        cls: 'bg-orange-500/10  text-orange-600  dark:text-orange-400  border-orange-500/20'  },
  cancelled: { label: 'Cancelled', Icon: XCircle,      cls: 'bg-red-500/10     text-red-600     dark:text-red-400     border-red-500/20'     },
} as const

interface Props {
  saleId: string | null
  onClose: () => void
  onPrintReceipt?: (sale: Sale) => void
}

function Row({ label, value, bold, color }: {
  label: string; value: string; bold?: boolean; color?: string
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-dash-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn('text-sm', bold && 'font-semibold', color ?? 'text-foreground')}>
        {value}
      </span>
    </div>
  )
}

export default function SaleDetailDrawer({ saleId, onClose, onPrintReceipt }: Props) {
  const { data: sale, isFetching, isError } = useQuery({
    queryKey: ['sale', saleId],
    queryFn:  () => getSale(saleId!),
    enabled:  !!saleId,
    staleTime: 0,
    retry: 1,
  })

  const isOpen = !!saleId
  const sc = sale
    ? (STATUS_MAP[sale.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.partial)
    : null

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className={cn(
        'fixed top-0 right-0 h-full w-full sm:w-[440px] z-50 flex flex-col',
        'bg-dash-surface border-l border-dash-border shadow-2xl',
        'transition-transform duration-300 ease-out',
        isOpen ? 'translate-x-0' : 'translate-x-full',
      )}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-dash-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-base">Sale Details</h2>
              {sale && <p className="text-xs text-muted-foreground font-mono">{sale.sale_number}</p>}
              {isFetching && !sale && <p className="text-xs text-muted-foreground animate-pulse">Loading…</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {sale && onPrintReceipt && (
              <button
                onClick={() => onPrintReceipt(sale)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-dash-border hover:bg-dash-hover text-muted-foreground hover:text-foreground transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Receipt
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-dash-hover text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Skeleton – shown only on first fetch when no data yet */}
          {isFetching && !sale && (
            <div className="space-y-3 animate-pulse">
              <div className="h-6 w-28 bg-dash-bg rounded-full" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-dash-bg rounded-2xl" />
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && !isFetching && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-sm font-medium text-foreground">Could not load sale</p>
              <p className="text-xs text-muted-foreground">This may be an auth issue — try refreshing</p>
            </div>
          )}

          {/* Content — shown even while refetching (sale exists) */}
          {sale && (
            <div className={cn('space-y-4 transition-opacity duration-150', isFetching && 'opacity-60')}>

              {/* Status + date */}
              <div className="flex items-center justify-between">
                {sc && (
                  <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border', sc.cls)}>
                    <sc.Icon className="w-3.5 h-3.5" />
                    {sc.label}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">{fmtDate(sale.created_at)}</span>
              </div>

              {/* Customer */}
              <div className="bg-dash-bg rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-dash-surface border border-dash-border flex items-center justify-center shrink-0">
                  {sale.customer
                    ? <span className="text-xs font-bold text-primary uppercase">
                        {sale.customer.first_name[0]}{sale.customer.last_name[0]}
                      </span>
                    : <User className="w-4 h-4 text-muted-foreground" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {sale.customer
                      ? `${sale.customer.first_name} ${sale.customer.last_name}`
                      : 'Walk-in Customer'}
                  </p>
                  {sale.customer?.phone_number && (
                    <p className="text-xs text-muted-foreground mt-0.5">{sale.customer.phone_number}</p>
                  )}
                  {sale.customer?.email && (
                    <p className="text-xs text-muted-foreground">{sale.customer.email}</p>
                  )}
                </div>
              </div>

              {/* Staff */}
              {sale.staff_name && (
                <div className="bg-dash-bg rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-dash-surface border border-dash-border flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Served by</p>
                    <p className="text-sm font-semibold text-foreground">{sale.staff_name}</p>
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> Items Purchased
                </p>
                <div className="bg-dash-bg rounded-2xl divide-y divide-dash-border overflow-hidden">
                  {(!sale.items || sale.items.length === 0) && (
                    <p className="px-4 py-3 text-sm text-muted-foreground italic">No item details</p>
                  )}
                  {sale.items?.map((item, idx) => (
                    <div key={item.id ?? idx} className="flex items-start justify-between px-4 py-3 gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {fmt(item.unit_price)} × {item.quantity}
                          {item.discount > 0 && (
                            <span className="text-red-400"> − {fmt(item.discount)} disc.</span>
                          )}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-foreground shrink-0">
                        {fmt(item.total_price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financials */}
              <div className="bg-dash-bg rounded-2xl px-4 py-1">
                <Row label="Subtotal" value={fmt(sale.sub_total)} />
                {sale.discount_amount > 0 && (
                  <Row label="Discount" value={`− ${fmt(sale.discount_amount)}`} />
                )}
                {sale.vat_amount > 0 && (
                  <Row label={`VAT (${sale.vat_rate}%)`} value={fmt(sale.vat_amount)} />
                )}
                <Row label="Total"       value={fmt(sale.total_amount)} bold />
                <Row label="Amount Paid" value={fmt(sale.amount_paid)}  bold />
                {sale.balance_due > 0 && (
                  <Row label="Balance Due" value={fmt(sale.balance_due)} bold color="text-red-500" />
                )}
              </div>

              {/* Payment method */}
              <div className="bg-dash-bg rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-dash-surface border border-dash-border flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Payment Method</p>
                  <p className="text-sm font-semibold text-foreground capitalize">{sale.payment_method}</p>
                </div>
              </div>

              {sale.notes && (
                <div className="bg-dash-bg rounded-2xl p-4">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-foreground">{sale.notes}</p>
                </div>
              )}

              {/* Balance warning */}
              {sale.balance_due > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-0.5">
                    Outstanding Balance
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {fmt(sale.balance_due)} has been recorded as a debt for this customer.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
