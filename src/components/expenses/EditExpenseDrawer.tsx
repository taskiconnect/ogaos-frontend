'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { updateExpense } from '@/lib/api/finance'
import { X, Loader2, Calendar, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Expense, UpdateExpenseRequest } from '@/lib/api/types'

interface Props {
  expense: Expense
  onClose: () => void
  onSuccess: () => void
}

function formatCurrency(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatDisplayDate(isoString: string): string {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoString))
}

function toDateInputValue(isoString: string): string {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return isoString.slice(0, 10)
  return date.toISOString().slice(0, 10)
}

function toIsoUtcMidnight(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)).toISOString()
}

const CATEGORIES = [
  'Rent',
  'Salaries',
  'Utilities',
  'Marketing',
  'Transport',
  'Equipment',
  'Supplies',
  'Maintenance',
  'Insurance',
  'Other',
]

const TYPE_CLS: Record<string, string> = {
  opex: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  capex: 'border-purple-500/20 bg-purple-500/10 text-purple-400',
}

export default function EditExpenseDrawer({
  expense,
  onClose,
  onSuccess,
}: Props) {
  const [category, setCategory] = useState(expense.category)
  const [description, setDescription] = useState(expense.description)
  const [amount, setAmount] = useState(String(expense.amount / 100))
  const [expenseDate, setExpenseDate] = useState(toDateInputValue(expense.expense_date))
  const [error, setError] = useState('')

  const mut = useMutation({
    mutationFn: (req: UpdateExpenseRequest) => updateExpense(expense.id, req),
    onSuccess: () => {
      onSuccess()
    },
    onError: (e: any) => {
      setError(e?.response?.data?.message ?? 'Update failed')
    },
  })

  function handleSave() {
    setError('')

    if (!description.trim()) {
      setError('Description is required')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Enter a valid amount')
      return
    }

    if (!expenseDate) {
      setError('Date is required')
      return
    }

    mut.mutate({
      category,
      description: description.trim(),
      amount: Math.round(parseFloat(amount) * 100),
      expense_date: toIsoUtcMidnight(expenseDate),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex h-full w-full flex-col overflow-y-auto border-l border-white/10 bg-[#0f0f14] sm:w-[440px]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0f0f14] px-6 py-4">
          <h2 className="text-lg font-bold text-white">Edit Expense</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 space-y-5 p-6">
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-bold uppercase',
                  TYPE_CLS[expense.expense_type] ?? TYPE_CLS.opex
                )}
              >
                {expense.expense_type}
              </span>
              <span className="text-xl font-bold text-white">
                {formatCurrency(expense.amount)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar className="h-3 w-3" />
              {formatDisplayDate(expense.expense_date)}
              <span className="mx-1">·</span>
              <Tag className="h-3 w-3" />
              {expense.category}
            </div>

            {expense.is_tax_deductible && (
              <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                Tax deductible
              </span>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0f0f14] px-4 py-3 text-sm text-white focus:outline-none"
            >
              {CATEGORIES.map((item) => (
                <option
                  key={item}
                  value={item}
                  className="bg-[#0f0f14] text-white"
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Description
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-white/25 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Amount (₦)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Date
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        <div className="sticky bottom-0 border-t border-white/10 bg-[#0f0f14] p-4">
          <button
            type="button"
            onClick={handleSave}
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
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}