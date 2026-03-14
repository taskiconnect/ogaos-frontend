'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createExpense } from '@/lib/api/finance'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CreateExpenseRequest } from '@/lib/api/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const CATEGORIES = [
  'Rent', 'Salaries', 'Utilities', 'Marketing', 'Transport',
  'Equipment', 'Supplies', 'Maintenance', 'Insurance', 'Other',
]

function today() {
  const d = new Date(), p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`
}

export default function CreateExpenseModal({ open, onOpenChange, onSuccess }: Props) {
  const [expenseType, setExpenseType]       = useState<'opex'|'capex'>('opex')
  const [category, setCategory]             = useState('Other')
  const [description, setDescription]       = useState('')
  const [amount, setAmount]                 = useState('')
  const [expenseDate, setExpenseDate]       = useState(today())
  const [vatRate, setVatRate]               = useState(0)
  const [vatInclusive, setVatInclusive]     = useState(false)
  const [isTaxDeductible, setIsTaxDeductible] = useState(false)
  const [assetLifeYears, setAssetLifeYears] = useState('')
  const [error, setError] = useState('')

  const mut = useMutation({
    mutationFn: (req: CreateExpenseRequest) => createExpense(req),
    onSuccess: () => { onSuccess(); onOpenChange(false); reset() },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed to add expense'),
  })

  function reset() {
    setExpenseType('opex'); setCategory('Other'); setDescription(''); setAmount('')
    setExpenseDate(today()); setVatRate(0); setVatInclusive(false)
    setIsTaxDeductible(false); setAssetLifeYears(''); setError('')
  }

  function handleSubmit() {
    setError('')
    if (!description.trim()) { setError('Description is required'); return }
    if (!amount || parseFloat(amount) <= 0) { setError('Enter a valid amount'); return }
    if (!expenseDate) { setError('Date is required'); return }

    mut.mutate({
      expense_type: expenseType,
      category,
      description: description.trim(),
      amount: Math.round(parseFloat(amount) * 100),
      expense_date: expenseDate,
      vat_rate: vatRate,
      vat_inclusive: vatInclusive,
      is_tax_deductible: isTaxDeductible,
      asset_life_years: expenseType === 'capex' && assetLifeYears ? parseInt(assetLifeYears) : undefined,
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative w-full sm:max-w-lg max-h-[95vh] overflow-y-auto bg-[#0f0f14] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl">

        <div className="sticky top-0 bg-[#0f0f14] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-white">Add Expense</h2>
          <button onClick={() => onOpenChange(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Type toggle */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Expense Type</label>
            <div className="flex gap-2">
              {(['opex', 'capex'] as const).map(t => (
                <button key={t} onClick={() => setExpenseType(t)}
                  className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold uppercase border transition-all',
                    expenseType === t
                      ? t === 'opex' ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'bg-purple-500/20 border-purple-500/40 text-purple-400'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20')}>
                  {t}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {expenseType === 'opex' ? 'Operating expense — day-to-day costs (rent, salaries, utilities)' : 'Capital expense — long-term assets (equipment, machinery)'}
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Monthly office rent for March"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25" />
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Amount (₦)</label>
              <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Date</label>
              <input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
            </div>
          </div>

          {/* VAT */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">VAT Rate (%)</label>
              <input type="number" min="0" max="100" value={vatRate} onChange={e => setVatRate(parseFloat(e.target.value)||0)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
            </div>
            <div className="flex items-center gap-2 mt-5">
              <button onClick={() => setVatInclusive(v => !v)}
                className={cn('w-10 h-6 rounded-full border transition-all relative', vatInclusive ? 'bg-primary border-primary' : 'bg-white/5 border-white/20')}>
                <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all', vatInclusive ? 'left-4' : 'left-0.5')} />
              </button>
              <span className="text-xs text-gray-400">VAT inclusive</span>
            </div>
          </div>

          {/* CapEx fields */}
          {expenseType === 'capex' && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Asset Life (years)</label>
              <input type="number" min="1" value={assetLifeYears} onChange={e => setAssetLifeYears(e.target.value)}
                placeholder="e.g. 5"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
            </div>
          )}

          {/* Tax deductible toggle */}
          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
            <button onClick={() => setIsTaxDeductible(v => !v)}
              className={cn('w-10 h-6 rounded-full border transition-all relative shrink-0', isTaxDeductible ? 'bg-emerald-500 border-emerald-500' : 'bg-white/5 border-white/20')}>
              <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all', isTaxDeductible ? 'left-4' : 'left-0.5')} />
            </button>
            <div>
              <p className="text-sm text-white font-medium">Tax deductible</p>
              <p className="text-xs text-gray-500">Mark this expense as deductible from business tax</p>
            </div>
          </div>

          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

          <button onClick={handleSubmit} disabled={mut.isPending}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
            {mut.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Add Expense'}
          </button>

        </div>
      </div>
    </div>
  )
}
