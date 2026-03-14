'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { recordInvoicePayment } from '@/lib/api/finance'
import { X, Send, XCircle, DollarSign, Loader2, User, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Invoice } from '@/lib/api/types'

interface Props {
  invoice: Invoice
  onClose: () => void
  onSend: () => void
  onCancel: () => void
  onPayment: () => void
}

function fmt(kobo: number) {
  const n = kobo / 100
  if (n >= 1_000_000) return `₦${(n/1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `₦${(n/1_000).toFixed(0)}k`
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}
function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-NG', { day:'numeric', month:'short', year:'numeric' }).format(new Date(iso))
}

const STATUS_CLS: Record<string, string> = {
  draft:     'bg-gray-500/10 text-gray-400 border-gray-500/20',
  sent:      'bg-blue-500/10 text-blue-400 border-blue-500/20',
  paid:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  overdue:   'bg-red-500/10 text-red-400 border-red-500/20',
  cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
}

export default function InvoiceDetailDrawer({ invoice: inv, onClose, onSend, onCancel, onPayment }: Props) {
  const [payAmount, setPayAmount] = useState('')
  const [showPayForm, setShowPayForm] = useState(false)
  const [error, setError] = useState('')

  const payMut = useMutation({
    mutationFn: () => recordInvoicePayment(inv.id, Math.round(parseFloat(payAmount) * 100)),
    onSuccess: () => { onPayment(); setShowPayForm(false); setPayAmount(''); onClose() },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Payment failed'),
  })

  const custName = inv.customer
    ? `${inv.customer.first_name} ${inv.customer.last_name}`.trim()
    : 'No customer'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:w-[480px] h-full bg-[#0f0f14] border-l border-white/10 flex flex-col overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-[#0f0f14] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-xs text-gray-500 font-mono">{inv.invoice_number}</p>
            <h2 className="text-lg font-bold text-white">{custName}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-6">

          {/* Status + amounts */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border capitalize', STATUS_CLS[inv.status] ?? STATUS_CLS.draft)}>
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
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span className="text-gray-400">Amount Paid</span>
                <span className="text-emerald-400 font-semibold">{fmt(inv.amount_paid)}</span>
              </div>
              {inv.balance_due > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Balance Due</span>
                  <span className="text-yellow-400 font-bold">{fmt(inv.balance_due)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Customer</p>
                <p className="text-sm text-white font-medium">{custName}</p>
                {inv.customer?.phone_number && <p className="text-xs text-gray-400">{inv.customer.phone_number}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Issue Date</p>
                <p className="text-sm text-white">{fmtDate(inv.issue_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Due Date</p>
                <p className={cn('text-sm font-medium', inv.status === 'overdue' ? 'text-red-400' : 'text-white')}>{fmtDate(inv.due_date)}</p>
              </div>
            </div>
            {inv.payment_terms && (
              <div className="flex items-start gap-3">
                <DollarSign className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Payment Terms</p>
                  <p className="text-sm text-white">{inv.payment_terms}</p>
                </div>
              </div>
            )}
          </div>

          {/* Items */}
          {inv.items && inv.items.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Line Items</h3>
              <div className="space-y-2">
                {inv.items.map(item => (
                  <div key={item.id} className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white font-medium">{item.description}</p>
                      <p className="text-xs text-gray-500">{fmt(item.unit_price)} x {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-white">{fmt(item.total_price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {inv.notes && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</h3>
              <p className="text-sm text-gray-300 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">{inv.notes}</p>
            </div>
          )}

          {/* Record payment */}
          {['sent', 'overdue', 'partial'].includes(inv.status) && inv.balance_due > 0 && (
            <div>
              {!showPayForm ? (
                <button onClick={() => setShowPayForm(true)}
                  className="w-full py-3 rounded-xl border border-emerald-500/30 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/10 transition-colors flex items-center justify-center gap-2">
                  <DollarSign className="w-4 h-4" /> Record Payment
                </button>
              ) : (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-emerald-400">Record Payment</p>
                  <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                    placeholder={`Amount (max ₦${(inv.balance_due/100).toFixed(2)})`}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => { setShowPayForm(false); setPayAmount(''); setError('') }}
                      className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:bg-white/10 transition-colors">
                      Cancel
                    </button>
                    <button onClick={() => payMut.mutate()} disabled={payMut.isPending || !payAmount}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-sm text-emerald-400 font-semibold hover:bg-emerald-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {payMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Actions footer */}
        <div className="sticky bottom-0 bg-[#0f0f14] border-t border-white/10 p-4 flex gap-3">
          {inv.status === 'draft' && (
            <button onClick={onSend}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
              <Send className="w-4 h-4" /> Send Invoice
            </button>
          )}
          {['draft','sent','overdue'].includes(inv.status) && (
            <button onClick={onCancel}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4" /> Cancel
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
