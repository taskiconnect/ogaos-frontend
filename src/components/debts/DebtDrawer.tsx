'use client'

// src/components/debts/DebtDrawer.tsx
// Handles payment for both:
//   - Manual debt records  → POST /debts/:id/payment
//   - Sale-derived debts   → POST /sales/:id/payment  (installments supported)

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { recordDebtPayment, recordSalePayment } from '@/lib/api/finance'
import {
  X, TrendingUp, TrendingDown, DollarSign, Calendar,
  Loader2, User, ShoppingCart, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Debt } from '@/lib/api/types'

interface Props {
  debt: Debt
  onClose: () => void
  onPayment: () => void
}

function fmt(kobo: number) {
  const n = kobo / 100
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}
function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}
function partyName(d: Debt) {
  if (d.customer) return `${d.customer.first_name} ${d.customer.last_name}`.trim()
  return d.supplier_name ?? 'Walk-in customer'
}

const STATUS_CLS: Record<string, string> = {
  outstanding: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  partial:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  overdue:     'bg-red-500/10 text-red-400 border-red-500/20',
  settled:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'POS', 'Cheque', 'Other']

export default function DebtDrawer({ debt: d, onClose, onPayment }: Props) {
  const qc = useQueryClient()

  const [showPayForm,    setShowPayForm]    = useState(false)
  const [payAmount,      setPayAmount]      = useState('')
  const [payMethod,      setPayMethod]      = useState('Cash')
  const [payNote,        setPayNote]        = useState('')
  const [error,          setError]          = useState('')
  const [success,        setSuccess]        = useState(false)

  const isReceivable = d.direction === 'receivable'

  // A sale-derived debt has a description like "Balance from sale SL-000001"
  // and its id matches the sale id (set by saleToDebt() in the debts page)
  const isSaleDerived = d.description.startsWith('Balance from sale ')

  // Extract sale number for display
  const saleNumber = isSaleDerived
    ? d.description.replace('Balance from sale ', '').trim()
    : null

  // ── Payment mutation ──────────────────────────────────────────────────────

  const amountKobo = Math.round(parseFloat(payAmount) * 100)

  const debtPayMut = useMutation({
    mutationFn: () => recordDebtPayment(d.id, {
      amount: amountKobo,
      note:   payNote || undefined,
    }),
    onSuccess: () => handleSuccess(),
    onError:   (e: any) => setError(e?.response?.data?.message ?? 'Payment failed'),
  })

  const salePayMut = useMutation({
    mutationFn: () => recordSalePayment(d.id, {
      amount:         amountKobo,
      payment_method: payMethod,
      note:           payNote || undefined,
    }),
    onSuccess: () => handleSuccess(),
    onError:   (e: any) => setError(e?.response?.data?.message ?? 'Payment failed'),
  })

  const isPending = debtPayMut.isPending || salePayMut.isPending

  function handleSuccess() {
    setSuccess(true)
    qc.invalidateQueries({ queryKey: ['debts'] })
    qc.invalidateQueries({ queryKey: ['sales', 'partial-for-debts'] })
    qc.invalidateQueries({ queryKey: ['dashboard'] })
    setTimeout(() => {
      onPayment()
      setShowPayForm(false)
      setPayAmount('')
      setPayNote('')
      setSuccess(false)
    }, 1200)
  }

  function submitPayment() {
    setError('')
    if (!payAmount || isNaN(amountKobo) || amountKobo < 1) {
      setError('Enter a valid amount')
      return
    }
    if (amountKobo > d.amount_due) {
      setError(`Amount exceeds balance due of ${fmt(d.amount_due)}`)
      return
    }
    if (isSaleDerived) {
      salePayMut.mutate()
    } else {
      debtPayMut.mutate()
    }
  }

  // Progress bar percentage
  const paidPct = d.total_amount > 0
    ? Math.min(100, Math.round((d.amount_paid / d.total_amount) * 100))
    : 0

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:w-[460px] h-full bg-[#0f0f14] border-l border-white/10 flex flex-col">

        {/* Header */}
        <div className="sticky top-0 bg-[#0f0f14] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2">
            <div className={cn('w-7 h-7 rounded-lg border flex items-center justify-center',
              isReceivable ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20')}>
              {isSaleDerived
                ? <ShoppingCart className="w-4 h-4 text-emerald-400" />
                : isReceivable
                  ? <TrendingUp className="w-4 h-4 text-emerald-400" />
                  : <TrendingDown className="w-4 h-4 text-red-400" />
              }
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">
                {isSaleDerived ? `Sale ${saleNumber}` : isReceivable ? 'Receivable' : 'Payable'}
              </h2>
              {isSaleDerived && (
                <p className="text-[10px] text-blue-400 font-medium">From sale record</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 pb-8">

          {/* Amount card with progress */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border capitalize',
                STATUS_CLS[d.status] ?? STATUS_CLS.outstanding)}>
                {d.status}
              </span>
              <span className="text-2xl font-bold text-white">{fmt(d.total_amount)}</span>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Paid {paidPct}%</span>
                <span>{fmt(d.amount_due)} remaining</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${paidPct}%`,
                    background: paidPct === 100
                      ? 'linear-gradient(90deg, #10b981, #34d399)'
                      : 'linear-gradient(90deg, #002b9d, #3f9af5)',
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-3 py-2.5">
                <p className="text-xs text-gray-500 mb-0.5">Paid so far</p>
                <p className="font-bold text-emerald-400">{fmt(d.amount_paid)}</p>
              </div>
              <div className={cn('border rounded-xl px-3 py-2.5',
                d.amount_due > 0 ? 'bg-yellow-500/5 border-yellow-500/10' : 'bg-emerald-500/5 border-emerald-500/10')}>
                <p className="text-xs text-gray-500 mb-0.5">Balance due</p>
                <p className={cn('font-bold', d.amount_due > 0 ? 'text-yellow-400' : 'text-emerald-400')}>
                  {fmt(d.amount_due)}
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">{isReceivable ? 'Customer' : 'Supplier'}</p>
                <p className="text-sm font-medium text-white">{partyName(d)}</p>
                {d.customer?.phone_number && (
                  <p className="text-xs text-gray-400">{d.customer.phone_number}</p>
                )}
                {d.supplier_phone && (
                  <p className="text-xs text-gray-400">{d.supplier_phone}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-sm text-white">{d.description}</p>
              </div>
            </div>

            {d.due_date && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Due date</p>
                  <p className={cn('text-sm font-medium',
                    d.status === 'overdue' ? 'text-red-400' : 'text-white')}>
                    {fmtDate(d.due_date)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
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

          {/* Payment section */}
          {d.status !== 'settled' && d.amount_due > 0 && (
            <div>
              {!showPayForm ? (
                <button onClick={() => setShowPayForm(true)}
                  className="w-full py-3.5 rounded-xl border border-emerald-500/30 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/10 transition-colors flex items-center justify-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Record Payment
                  <span className="text-xs font-normal opacity-70">
                    (installments OK)
                  </span>
                </button>
              ) : (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-emerald-400">Record Payment</p>
                    <p className="text-xs text-gray-500">
                      Balance: <span className="text-yellow-400 font-semibold">{fmt(d.amount_due)}</span>
                    </p>
                  </div>

                  {/* Quick amount buttons */}
                  <div className="flex gap-2">
                    {[25, 50, 100].map(pct => {
                      const val = ((d.amount_due / 100) * pct / 100).toFixed(2)
                      return (
                        <button key={pct} type="button"
                          onClick={() => setPayAmount(val)}
                          className="flex-1 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                          {pct === 100 ? 'Full' : `${pct}%`}
                        </button>
                      )
                    })}
                    <button type="button"
                      onClick={() => setPayAmount((d.amount_due / 100).toFixed(2))}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                      Pay all
                    </button>
                  </div>

                  {/* Amount input */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₦</span>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={e => { setPayAmount(e.target.value); setError('') }}
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/40"
                    />
                  </div>

                  {/* Payment method */}
                  <div className="flex gap-2 flex-wrap">
                    {PAYMENT_METHODS.map(m => (
                      <button key={m} type="button" onClick={() => setPayMethod(m)}
                        className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                          payMethod === m
                            ? 'bg-primary/20 border-primary/40 text-primary'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20')}>
                        {m}
                      </button>
                    ))}
                  </div>

                  {/* Note */}
                  <input
                    value={payNote}
                    onChange={e => setPayNote(e.target.value)}
                    placeholder="Note (optional, e.g. 'Installment 1 of 3')"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
                  />

                  {error && (
                    <div className="flex items-center gap-2 text-xs text-red-400">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      Payment recorded successfully!
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => { setShowPayForm(false); setPayAmount(''); setPayNote(''); setError('') }}
                      className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:bg-white/10">
                      Cancel
                    </button>
                    <button
                      onClick={submitPayment}
                      disabled={isPending || !payAmount || success}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-sm text-emerald-400 font-semibold hover:bg-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-2">
                      {isPending
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Recording...</>
                        : success
                          ? <><CheckCircle2 className="w-4 h-4" /> Done!</>
                          : `Confirm ${payAmount ? `₦${parseFloat(payAmount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}` : ''}`
                      }
                    </button>
                  </div>

                  {/* Remaining after payment hint */}
                  {payAmount && !isNaN(parseFloat(payAmount)) && amountKobo < d.amount_due && (
                    <p className="text-xs text-gray-500 text-center">
                      {fmt(d.amount_due - amountKobo)} will still be outstanding after this payment
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {d.status === 'settled' && (
            <div className="flex items-center gap-2 justify-center py-4 text-emerald-400 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5" />
              Fully paid — settled
            </div>
          )}

        </div>
      </div>
    </div>
  )
}