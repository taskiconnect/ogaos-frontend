'use client'

import { useEffect } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createExpense, updateExpense } from '@/lib/api/finance'
import { X, Receipt } from 'lucide-react'
import { toast } from 'sonner'
import type { Expense } from '@/lib/api/types'

const CATEGORIES = [
  'rent',
  'utilities',
  'salaries',
  'supplies',
  'marketing',
  'transport',
  'maintenance',
  'equipment',
  'taxes',
  'insurance',
  'food',
  'software',
  'other',
]

const schema = z.object({
  description: z.string().trim().min(1, 'Required'),
  amount: z.coerce.number().min(1, 'Must be > 0'),
  expense_type: z.enum(['opex', 'capex']),
  category: z.string().min(1, 'Required'),
  expense_date: z.string().min(1, 'Required'),
})

type FormInput = z.input<typeof schema>
type FormData = z.output<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess?: () => void
  editing?: Expense | null
}

function toDateInputValue(isoString?: string | null): string {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
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

export default function AddExpenseModal({
  open,
  onOpenChange,
  onSuccess,
  editing,
}: Props) {
  const qc = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: '',
      amount: 0,
      expense_type: 'opex',
      category: '',
      expense_date: toDateInputValue(new Date().toISOString()),
    },
  })

  useEffect(() => {
    if (editing) {
      reset({
        description: editing.description,
        amount: editing.amount / 100,
        expense_type: editing.expense_type === 'capex' ? 'capex' : 'opex',
        category: editing.category,
        expense_date: toDateInputValue(editing.expense_date),
      })
      return
    }

    reset({
      description: '',
      amount: 0,
      expense_type: 'opex',
      category: '',
      expense_date: toDateInputValue(new Date().toISOString()),
    })
  }, [editing, reset])

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        description: data.description.trim(),
        amount: Math.round(data.amount * 100),
        expense_type: data.expense_type,
        category: data.category,
        expense_date: toIsoUtcMidnight(data.expense_date),
      }

      return editing ? updateExpense(editing.id, payload) : createExpense(payload)
    },
    onSuccess: () => {
      toast.success(editing ? 'Expense updated!' : 'Expense recorded!')
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['expense-summary'] })

      reset({
        description: '',
        amount: 0,
        expense_type: 'opex',
        category: '',
        expense_date: toDateInputValue(new Date().toISOString()),
      })

      onOpenChange(false)
      onSuccess?.()
    },
    onError: (e: any) => {
      toast.error(getErrorMessage(e, 'Failed to save expense'))
    },
  })

  if (!open) return null

  const inputCls =
    'w-full h-10 rounded-xl bg-dash-bg border border-dash-border px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30'

  const selectCls =
    'w-full h-10 rounded-xl bg-[#0f0f14] border border-dash-border px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/30'

  const onSubmit: SubmitHandler<FormData> = (data) => {
    mutation.mutate(data)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative flex max-h-[92vh] w-full flex-col rounded-t-3xl border border-dash-border bg-dash-surface shadow-2xl sm:max-w-lg sm:rounded-3xl">
        <div className="shrink-0 flex items-center justify-between border-b border-dash-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10">
              <Receipt className="h-5 w-5 text-orange-500" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {editing ? 'Edit Expense' : 'Record Expense'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Track your business spending
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-dash-hover hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Description
            </label>

            <input
              {...register('description')}
              placeholder="e.g. Office rent, Diesel, Staff salary"
              className={inputCls}
            />

            {errors.description && (
              <p className="mt-1 text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Amount (₦)
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                {...register('amount')}
                placeholder="0"
                className={inputCls}
              />

              {errors.amount && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Date
              </label>

              <input type="date" {...register('expense_date')} className={inputCls} />

              {errors.expense_date && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.expense_date.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Type
              </label>

              <select {...register('expense_type')} className={`${selectCls} cursor-pointer`}>
                <option value="opex" className="bg-[#0f0f14] text-white">
                  OpEx (Operating)
                </option>
                <option value="capex" className="bg-[#0f0f14] text-white">
                  CapEx (Capital)
                </option>
              </select>

              {errors.expense_type && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.expense_type.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Category
              </label>

              <select {...register('category')} className={`${selectCls} cursor-pointer`}>
                <option value="" className="bg-[#0f0f14] text-gray-400">
                  Select category
                </option>

                {CATEGORIES.map((category) => (
                  <option key={category} value={category} className="bg-[#0f0f14] text-white">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>

              {errors.category && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 flex justify-end gap-3 rounded-b-3xl border-t border-dash-border bg-dash-bg px-6 py-5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-dash-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={mutation.isPending}
            className="rounded-xl px-8 py-2.5 text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
          >
            {mutation.isPending ? 'Saving…' : editing ? 'Update' : 'Record Expense'}
          </button>
        </div>
      </div>
    </div>
  )
}