'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { updateExpense } from '@/lib/api/finance'
import { X, Loader2, Receipt, Calendar, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Expense, UpdateExpenseRequest } from '@/lib/api/types'

interface Props {
  expense: Expense
  onClose: () => void
  onSuccess: () => void
}

function fmt(kobo: number) {
  return `₦${(kobo/100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}
function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-NG', { day:'numeric', month:'short', year:'numeric' }).format(new Date(iso))
}

const CATEGORIES = [
  'Rent', 'Salaries', 'Utilities', 'Marketing', 'Transport',
  'Equipment', 'Supplies', 'Maintenance', 'Insurance', 'Other',
]
const TYPE_CLS: Record<string, string> = {
  opex:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  capex: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export default function EditExpenseDrawer({ expense: exp, onClose, onSuccess }: Props) {
  const [category, setCategory]       = useState(exp.category)
  const [description, setDescription] = useState(exp.description)
  const [amount, setAmount]           = useState(String(exp.amount / 100))
  const [expenseDate, setExpenseDate] = useState(exp.expense_date.slice(0, 10))
  const [error, setError] = useState('')

  const mut = useMutation({
    mutationFn: (req: UpdateExpenseRequest) => updateExpense(exp.id, req),
    onSuccess: () => { onSuccess() },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Update failed'),
  })

  function handleSave() {
    setError('')
    if (!description.trim()) { setError('Description is required'); return }
    if (!amount || parseFloat(amount) <= 0) { setError('Enter a valid amount'); return }
    mut.mutate({
      category,
      description: description.trim(),
      amount: Math.round(parseFloat(amount) * 100),
      expense_date: expenseDate,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:w-[440px] h-full bg-[#0f0f14] border-l border-white/10 flex flex-col overflow-y-auto">

        <div className="sticky top-0 bg-[#0f0f14] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-white">Edit Expense</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-5">

          {/* Read-only info */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className={cn('text-xs font-bold uppercase px-2.5 py-1 rounded-full border', TYPE_CLS[exp.expense_type] ?? TYPE_CLS.opex)}>
                {exp.expense_type}
              </span>
              <span className="text-xl font-bold text-white">{fmt(exp.amount)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar className="w-3 h-3" /> {fmtDate(exp.expense_date)}
              <span className="mx-1">·</span>
              <Tag className="w-3 h-3" /> {exp.category}
            </div>
            {exp.is_tax_deductible && (
              <span className="inline-flex text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Tax deductible
              </span>
            )}
          </div>

          {/* Editable fields */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Amount (₦)</label>
              <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Date</label>
              <input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
            </div>
          </div>

          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

        </div>

        <div className="sticky bottom-0 bg-[#0f0f14] border-t border-white/10 p-4">
          <button onClick={handleSave} disabled={mut.isPending}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
            {mut.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  )
}
