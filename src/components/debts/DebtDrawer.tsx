'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { recordDebtPayment } from '@/lib/api/finance'
import { X, TrendingUp, TrendingDown, DollarSign, Calendar, Loader2, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Debt } from '@/lib/api/types'

interface Props {
  debt: Debt
  onClose: () => void
  onPayment: () => void
}

function fmt(kobo: number) {
  const n = kobo / 100
  if (n >= 1_000_000) return `₦${(n/1_000_000).toFixed(1)}M`
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}
function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-NG', { day:'numeric', month:'short', year:'numeric' }).format(new Date(iso))
}
function partyName(d: Debt) {
  if (d.customer) return `${d.customer.first_name} ${d.customer.last_name}`.trim()
  return d.supplier_name ?? 'Unknown'
}

const STATUS_CLS: Record<string, string> = {
  outstanding: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  partial:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  overdue:     'bg-red-500/10 text-red-400 border-red-500/20',
  settled:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

export default function DebtDrawer({ debt: d, onClose, onPayment }: Props) {
  const [showPayForm, setShowPayForm] = useState(false)
  const [payAmount, setPayAmount]     = useState('')
  const [payNote, setPayNote]         = useState('')
  const [error, setError]             = useState('')

  const payMut = useMutation({
    mutationFn: () => recordDebtPayment(d.id, { amount: Math.round(parseFloat(payAmount) * 100), note: payNote || undefined }),
    onSuccess: () => { onPayment(); setShowPayForm(false); setPayAmount(''); setPayNote('') },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Payment failed'),
  })

  const isReceivable = d.direction === 'receivable'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:w-[440px] h-full bg-[#0f0f14] border-l border-white/10 flex flex-col overflow-y-auto">

        <div className="sticky top-0 bg-[#0f0f14] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className={cn('w-7 h-7 rounded-lg border flex items-center justify-center',
              isReceivable ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20')}>
              {isReceivable ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
            </div>
            <h2 className="text-lg font-bold">{isReceivable ? 'Receivable' : 'Payable'}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-6">

          {/* Amounts */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border capitalize', STATUS_CLS[d.status] ?? STATUS_CLS.outstanding)}>
                {d.status}
              </span>
              <span className="text-2xl font-bold text-white">{fmt(d.total_amount)}</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Amount paid</span>
                <span className="text-emerald-400 font-semibold">{fmt(d.amount_paid)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span className="text-gray-400">Amount due</span>
                <span className={cn('font-bold', d.amount_due > 0 ? 'text-yellow-400' : 'text-emerald-400')}>
                  {fmt(d.amount_due)}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">{isReceivable ? 'Customer' : 'Supplier'}</p>
                <p className="text-sm font-medium text-white">{partyName(d)}</p>
                {d.customer?.phone_number && <p className="text-xs text-gray-400">{d.customer.phone_number}</p>}
                {d.supplier_phone && <p className="text-xs text-gray-400">{d.supplier_phone}</p>}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-sm text-white">{d.description}</p>
              </div>
            </div>
            {d.due_date && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Due date</p>
                  <p className={cn('text-sm font-medium', d.status === 'overdue' ? 'text-red-400' : 'text-white')}>
                    {fmtDate(d.due_date)}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Recorded</p>
                <p className="text-sm text-white">{fmtDate(d.created_at)}</p>
              </div>
            </div>
          </div>

          {d.notes && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-300">
              {d.notes}
            </div>
          )}

          {/* Record payment */}
          {d.status !== 'settled' && d.amount_due > 0 && (
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
                    placeholder={`Amount (max ₦${(d.amount_due/100).toFixed(2)})`}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
                  <input value={payNote} onChange={e => setPayNote(e.target.value)} placeholder="Note (optional)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => { setShowPayForm(false); setPayAmount(''); setPayNote(''); setError('') }}
                      className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:bg-white/10">Cancel</button>
                    <button onClick={() => payMut.mutate()} disabled={payMut.isPending || !payAmount}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-sm text-emerald-400 font-semibold hover:bg-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-2">
                      {payMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
