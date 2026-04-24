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

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function toIsoUtcMidnight(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)).toISOString()
}

function getErrorMessage(error: any, fallback: string): string {
  return (
    error?.message ||
    error?.response?.data?.message ||
    error?.data?.message ||
    fallback
  )
}

export default function CreateExpenseModal({
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [expenseType, setExpenseType] = useState<'opex' | 'capex'>('opex')
  const [category, setCategory] = useState('Other')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState(today())
  const [vatRate, setVatRate] = useState<number | ''>('')
  const [vatInclusive, setVatInclusive] = useState(false)
  const [isTaxDeductible, setIsTaxDeductible] = useState(false)
  const [assetLifeYears, setAssetLifeYears] = useState('')
  const [error, setError] = useState('')

  const mut = useMutation({
    mutationFn: (req: CreateExpenseRequest) => createExpense(req),
    onSuccess: () => {
      onSuccess()
      onOpenChange(false)
      reset()
    },
    onError: (e: any) => {
      setError(getErrorMessage(e, 'Failed to add expense'))
    },
  })

  function reset() {
    setExpenseType('opex')
    setCategory('Other')
    setDescription('')
    setAmount('')
    setExpenseDate(today())
    setVatRate('')
    setVatInclusive(false)
    setIsTaxDeductible(false)
    setAssetLifeYears('')
    setError('')
  }

  function handleSubmit() {
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

    const parsedAmount = parseFloat(amount)
    const isoExpenseDate = toIsoUtcMidnight(expenseDate)

    mut.mutate({
      expense_type: expenseType,
      category,
      description: description.trim(),
      amount: Math.round(parsedAmount * 100),
      expense_date: isoExpenseDate,
      vat_rate: vatRate === '' ? undefined : vatRate,
      vat_inclusive: vatInclusive,
      is_tax_deductible: isTaxDeductible,
      asset_life_years:
        expenseType === 'capex' && assetLifeYears
          ? parseInt(assetLifeYears, 10)
          : undefined,
      asset_start_date: expenseType === 'capex' ? isoExpenseDate : undefined,
    })
  }

  if (!open) return null

  const selectCls =
    'w-full rounded-xl border border-white/10 bg-[#0f0f14] px-4 py-3 text-sm text-white focus:outline-none'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative max-h-[95vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0f0f14] shadow-2xl sm:max-w-lg sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0f0f14] px-6 py-4">
          <h2 className="text-lg font-bold text-white">Add Expense</h2>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Expense Type
            </label>

            <div className="flex gap-2">
              {(['opex', 'capex'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setExpenseType(type)}
                  className={cn(
                    'flex-1 rounded-xl border py-2.5 text-sm font-semibold uppercase transition-all',
                    expenseType === type
                      ? type === 'opex'
                        ? 'border-blue-500/40 bg-blue-500/20 text-blue-400'
                        : 'border-purple-500/40 bg-purple-500/20 text-purple-400'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            <p className="mt-1.5 text-xs text-gray-500">
              {expenseType === 'opex'
                ? 'Operating expense — day-to-day costs'
                : 'Capital expense — long-term assets'}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={selectCls}
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item} className="bg-[#0f0f14] text-white">
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
              placeholder="e.g. Monthly office rent for March"
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
                placeholder="0.00"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-white/25 focus:outline-none"
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

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                VAT Rate (%)
              </label>

              <input
                type="number"
                min="0"
                max="100"
                value={vatRate}
                onChange={(e) =>
                  setVatRate(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="e.g. 7.5"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVatInclusive((value) => !value)}
                className={cn(
                  'relative h-6 w-10 rounded-full border transition-all',
                  vatInclusive ? 'border-primary bg-primary' : 'border-white/20 bg-white/5'
                )}
              >
                <div
                  className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                    vatInclusive ? 'left-4' : 'left-0.5'
                  )}
                />
              </button>

              <span className="text-xs text-gray-400">VAT inclusive</span>
            </div>
          </div>

          {expenseType === 'capex' && (
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Asset Life (years)
              </label>

              <input
                type="number"
                min="1"
                value={assetLifeYears}
                onChange={(e) => setAssetLifeYears(e.target.value)}
                placeholder="e.g. 5"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
            <button
              type="button"
              onClick={() => setIsTaxDeductible((value) => !value)}
              className={cn(
                'relative h-6 w-10 shrink-0 rounded-full border transition-all',
                isTaxDeductible
                  ? 'border-emerald-500 bg-emerald-500'
                  : 'border-white/20 bg-white/5'
              )}
            >
              <div
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                  isTaxDeductible ? 'left-4' : 'left-0.5'
                )}
              />
            </button>

            <div>
              <p className="text-sm font-medium text-white">Tax deductible</p>
              <p className="text-xs text-gray-500">
                Mark this expense as deductible from business tax
              </p>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="button"
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
              'Add Expense'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}