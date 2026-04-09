'use client'

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createDebt } from '@/lib/api/finance'
import { listCustomers } from '@/lib/api/business'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CreateDebtRequest } from '@/lib/api/types'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess: () => void
}

function today() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/**
 * Converts an HTML date input value (YYYY-MM-DD) into an RFC3339 timestamp.
 * We send midnight UTC for a consistent backend/API format.
 *
 * Example:
 * 2026-04-09 -> 2026-04-09T00:00:00Z
 */
function toRFC3339DateStart(dateStr: string): string | undefined {
  if (!dateStr) return undefined

  const [year, month, day] = dateStr.split('-').map(Number)
  if (!year || !month || !day) return undefined

  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0)).toISOString()
}

export default function CreateDebtModal({ open, onOpenChange, onSuccess }: Props) {
  const [direction, setDirection] = useState<'receivable' | 'payable'>('receivable')
  const [customerId, setCustomerId] = useState('')
  const [custSearch, setCustSearch] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [supplierPhone, setSupplierPhone] = useState('')
  const [description, setDescription] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const { data: custData } = useQuery({
    queryKey: ['customers-search', custSearch],
    queryFn: () => listCustomers({ search: custSearch, limit: 8 }),
    enabled: custSearch.length > 0 && direction === 'receivable',
  })

  const customers = custData?.data ?? []

  const mut = useMutation({
    mutationFn: (payload: CreateDebtRequest) => createDebt(payload),
    onSuccess: () => {
      onSuccess()
      onOpenChange(false)
      reset()
    },
    onError: (e: any) =>
      setError(e?.response?.data?.message ?? 'Failed to record debt'),
  })

  function reset() {
    setDirection('receivable')
    setCustomerId('')
    setCustSearch('')
    setSupplierName('')
    setSupplierPhone('')
    setDescription('')
    setTotalAmount('')
    setDueDate('')
    setNotes('')
    setError('')
  }

  function handleSubmit() {
    setError('')

    if (!description.trim()) {
      setError('Description is required')
      return
    }

    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      setError('Amount is required')
      return
    }

    if (direction === 'receivable' && !customerId) {
      setError('Customer is required for receivable debts')
      return
    }

    if (direction === 'payable' && !supplierName.trim()) {
      setError('Supplier/Creditor name is required for payable debts')
      return
    }

    const payload: CreateDebtRequest = {
      direction,
      customer_id: direction === 'receivable' ? customerId : undefined,
      supplier_name:
        direction === 'payable' ? supplierName.trim() || undefined : undefined,
      supplier_phone:
        direction === 'payable' ? supplierPhone.trim() || undefined : undefined,
      description: description.trim(),
      total_amount: Math.round(parseFloat(totalAmount) * 100),
      due_date: dueDate ? toRFC3339DateStart(dueDate) : undefined,
      notes: notes.trim() || undefined,
    }

    mut.mutate(payload)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative max-h-[95vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0f0f14] shadow-2xl sm:max-w-lg sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0f0f14] px-6 py-4">
          <h2 className="text-lg font-bold text-white">Record Debt</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Direction
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setDirection('receivable')}
                className={cn(
                  'flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-all',
                  direction === 'receivable'
                    ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                )}
              >
                Money owed to me
              </button>

              <button
                onClick={() => setDirection('payable')}
                className={cn(
                  'flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-all',
                  direction === 'payable'
                    ? 'border-red-500/40 bg-red-500/20 text-red-400'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                )}
              >
                Money I owe
              </button>
            </div>
          </div>

          {direction === 'receivable' ? (
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Customer *
              </label>
              <input
                value={custSearch}
                onChange={(e) => {
                  setCustSearch(e.target.value)
                  setCustomerId('')
                }}
                placeholder="Search customer..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-white/25 focus:outline-none"
              />

              {customers.length > 0 && !customerId && (
                <div className="mt-1 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a24]">
                  {customers.map((c: any) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCustomerId(c.id)
                        setCustSearch(`${c.first_name} ${c.last_name}`)
                      }}
                      className="w-full border-b border-white/5 px-4 py-3 text-left text-sm text-white hover:bg-white/5 last:border-0"
                    >
                      {c.first_name} {c.last_name}
                      {c.phone_number && (
                        <span className="ml-2 text-xs text-gray-500">
                          {c.phone_number}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Supplier/Creditor Name *
                </label>
                <input
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Who you owe"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Phone
                </label>
                <input
                  value={supplierPhone}
                  onChange={(e) => setSupplierPhone(e.target.value)}
                  placeholder="08012345678"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Description *
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this debt for?"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-white/25 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Amount (₦) *
              </label>
              <input
                type="number"
                min="0"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                min={today()}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any additional notes..."
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={mut.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
          >
            {mut.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Record Debt'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}