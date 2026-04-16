'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  recordInvoicePayment,
  downloadInvoicePdf,
} from '@/lib/api/finance'
import {
  X,
  Send,
  XCircle,
  DollarSign,
  Loader2,
  User,
  Calendar,
  Download,
  GitBranchPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Invoice } from '@/lib/api/types'

interface Props {
  invoice: Invoice
  onClose: () => void
  onSend: () => void
  onCancel: () => void
  onPayment: () => void
  onRevise?: () => void
}

function fmt(kobo: number) {
  const n = kobo / 100
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}k`
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

const STATUS_CLS: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  partial: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
  cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  superseded: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export default function InvoiceDetailDrawer({
  invoice: inv,
  onClose,
  onSend,
  onCancel,
  onPayment,
  onRevise,
}: Props) {
  const [payAmount, setPayAmount] = useState('')
  const [showPayForm, setShowPayForm] = useState(false)
  const [error, setError] = useState('')

  const payMut = useMutation({
    mutationFn: () => recordInvoicePayment(inv.id, Math.round(parseFloat(payAmount) * 100)),
    onSuccess: () => {
      onPayment()
      setShowPayForm(false)
      setPayAmount('')
      onClose()
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Payment failed'),
  })

  const pdfMut = useMutation({
    mutationFn: () => downloadInvoicePdf(inv.id, inv.invoice_number),
    onError: (e: any) => setError(e?.message ?? 'Failed to download PDF'),
  })

  const custName = inv.customer
    ? `${inv.customer.first_name} ${inv.customer.last_name}`.trim()
    : 'No customer'

  const canSend = inv.status === 'draft'
  const canCancel = ['draft', 'sent', 'overdue'].includes(inv.status)
  const canRecordPayment =
    ['sent', 'overdue', 'partial'].includes(inv.status) && inv.balance_due > 0
  const canRevise = ['sent', 'partial', 'paid', 'overdue'].includes(inv.status)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex h-full w-full flex-col overflow-y-auto border-l border-white/10 bg-[#0f0f14] sm:w-[480px]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0f0f14] px-6 py-4">
          <div>
            <p className="font-mono text-xs text-gray-500">{inv.invoice_number}</p>
            <h2 className="text-lg font-bold text-white">{custName}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 space-y-6 p-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-semibold capitalize',
                  STATUS_CLS[inv.status] ?? STATUS_CLS.draft
                )}
              >
                {inv.status}
              </span>
              <span className="text-2xl font-bold text-white">{fmt(inv.total_amount)}</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">{fmt(inv.sub_total)}</span>
              </div>

              {inv.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Discount</span>
                  <span className="text-red-400">-{fmt(inv.discount_amount)}</span>
                </div>
              )}

              {inv.vat_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">VAT ({inv.vat_rate}%)</span>
                  <span className="text-white">{fmt(inv.vat_amount)}</span>
                </div>
              )}

              {inv.wht_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">WHT ({inv.wht_rate}%)</span>
                  <span className="text-red-400">-{fmt(inv.wht_amount)}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-gray-400">Amount Paid</span>
                <span className="font-semibold text-emerald-400">{fmt(inv.amount_paid)}</span>
              </div>

              {inv.balance_due > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Balance Due</span>
                  <span className="font-bold text-yellow-400">{fmt(inv.balance_due)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => pdfMut.mutate()}
              disabled={pdfMut.isPending}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              {pdfMut.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {pdfMut.isPending ? 'Preparing PDF...' : 'Download PDF'}
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Customer</p>
                <p className="text-sm font-medium text-white">{custName}</p>
                {inv.customer?.phone_number && (
                  <p className="text-xs text-gray-400">{inv.customer.phone_number}</p>
                )}
                {inv.customer?.email && (
                  <p className="text-xs text-gray-400">{inv.customer.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Issue Date</p>
                <p className="text-sm text-white">{fmtDate(inv.issue_date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Due Date</p>
                <p className={cn('text-sm font-medium', inv.status === 'overdue' ? 'text-red-400' : 'text-white')}>
                  {fmtDate(inv.due_date)}
                </p>
              </div>
            </div>

            {inv.payment_terms && (
              <div className="flex items-start gap-3">
                <DollarSign className="mt-0.5 h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Payment Terms</p>
                  <p className="text-sm text-white">{inv.payment_terms}</p>
                </div>
              </div>
            )}

            {typeof inv.revision_number === 'number' && (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                <p className="text-xs text-gray-500">Revision</p>
                <p className="text-sm font-semibold text-white">Revision {inv.revision_number}</p>
              </div>
            )}
          </div>

          {inv.items && inv.items.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Line Items
              </h3>
              <div className="space-y-2">
                {inv.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{item.description}</p>
                      <p className="text-xs text-gray-500">
                        {fmt(item.unit_price)} x {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-white">{fmt(item.total_price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {inv.notes && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Notes
              </h3>
              <p className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-gray-300">
                {inv.notes}
              </p>
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {canRecordPayment && (
            <div>
              {!showPayForm ? (
                <button
                  onClick={() => setShowPayForm(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 py-3 text-sm font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/10"
                >
                  <DollarSign className="h-4 w-4" />
                  Record Payment
                </button>
              ) : (
                <div className="space-y-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="Enter amount paid"
                    className="w-full rounded-xl border border-white/10 bg-[#0f0f14] px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowPayForm(false)
                        setPayAmount('')
                        setError('')
                      }}
                      className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => payMut.mutate()}
                      disabled={payMut.isPending || !payAmount || parseFloat(payAmount) <= 0}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {payMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Save Payment
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 border-t border-white/10 bg-[#0f0f14] p-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {canSend && (
              <button
                onClick={onSend}
                className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-400 hover:bg-blue-500/20"
              >
                <Send className="h-4 w-4" />
                Send Invoice
              </button>
            )}

            {canRevise && onRevise && (
              <button
                onClick={onRevise}
                className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-sm font-semibold text-purple-400 hover:bg-purple-500/20"
              >
                <GitBranchPlus className="h-4 w-4" />
                Revise Invoice
              </button>
            )}

            {canCancel && (
              <button
                onClick={onCancel}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/20"
              >
                <XCircle className="h-4 w-4" />
                Cancel Invoice
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}