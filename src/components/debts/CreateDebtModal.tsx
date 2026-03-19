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
  const d = new Date(), p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`
}

export default function CreateDebtModal({ open, onOpenChange, onSuccess }: Props) {
  const [direction, setDirection]     = useState<'receivable'|'payable'>('receivable')
  const [customerId, setCustomerId]   = useState('')
  const [custSearch, setCustSearch]   = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [supplierPhone, setSupplierPhone] = useState('')
  const [description, setDescription] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [dueDate, setDueDate]         = useState('')
  const [notes, setNotes]             = useState('')
  const [error, setError]             = useState('')

  const { data: custData } = useQuery({
    queryKey: ['customers-search', custSearch],
    queryFn: () => listCustomers({ search: custSearch, limit: 8 }),
    enabled: custSearch.length > 0 && direction === 'receivable',
  })
  const customers = custData?.data ?? []

  const mut = useMutation({
    mutationFn: (d: CreateDebtRequest) => createDebt(d),
    onSuccess: () => { onSuccess(); onOpenChange(false); reset() },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed to record debt'),
  })

  function reset() {
    setDirection('receivable'); setCustomerId(''); setCustSearch(''); setSupplierName('')
    setSupplierPhone(''); setDescription(''); setTotalAmount(''); setDueDate(''); setNotes(''); setError('')
  }

  function handleSubmit() {
    setError('')
    if (!description.trim()) { setError('Description is required'); return }
    if (!totalAmount || parseFloat(totalAmount) <= 0) { setError('Amount is required'); return }
    mut.mutate({
      direction,
      customer_id: customerId || undefined,
      supplier_name: direction === 'payable' ? supplierName.trim() || undefined : undefined,
      supplier_phone: direction === 'payable' ? supplierPhone.trim() || undefined : undefined,
      description: description.trim(),
      total_amount: Math.round(parseFloat(totalAmount) * 100),
      due_date: dueDate || undefined,
      notes: notes.trim() || undefined,
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative w-full sm:max-w-lg max-h-[95vh] overflow-y-auto bg-[#0f0f14] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl">

        <div className="sticky top-0 bg-[#0f0f14] flex items-center justify-between px-6 py-4 border-b border-white/10 z-10">
          <h2 className="text-lg font-bold">Record Debt</h2>
          <button onClick={() => onOpenChange(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Direction toggle */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Direction</label>
            <div className="flex gap-2">
              <button onClick={() => setDirection('receivable')}
                className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all',
                  direction === 'receivable' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20')}>
                Money owed to me
              </button>
              <button onClick={() => setDirection('payable')}
                className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all',
                  direction === 'payable' ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20')}>
                Money I owe
              </button>
            </div>
          </div>

          {/* Party */}
          {direction === 'receivable' ? (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Customer (optional)</label>
              <input value={custSearch} onChange={e => { setCustSearch(e.target.value); setCustomerId('') }}
                placeholder="Search customer..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25" />
              {customers.length > 0 && !customerId && (
                <div className="mt-1 bg-[#1a1a24] border border-white/10 rounded-xl overflow-hidden">
                  {customers.map((c: any) => (
                    <button key={c.id} onClick={() => { setCustomerId(c.id); setCustSearch(`${c.first_name} ${c.last_name}`) }}
                      className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 border-b border-white/5 last:border-0">
                      {c.first_name} {c.last_name}{c.phone_number && <span className="text-gray-500 ml-2 text-xs">{c.phone_number}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Supplier/Creditor Name</label>
                <input value={supplierName} onChange={e => setSupplierName(e.target.value)} placeholder="Who you owe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Phone</label>
                <input value={supplierPhone} onChange={e => setSupplierPhone(e.target.value)} placeholder="08012345678"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description *</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this debt for?"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Amount (₦) *</label>
              <input type="number" min="0" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any additional notes..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none resize-none" />
          </div>

          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

          <button onClick={handleSubmit} disabled={mut.isPending}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
            {mut.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Record Debt'}
          </button>
        </div>
      </div>
    </div>
  )
}
