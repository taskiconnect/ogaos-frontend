'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createExpense, updateExpense } from '@/lib/api/finance'
import { X, Receipt } from 'lucide-react'
import { toast } from 'sonner'
import type { Expense } from '@/lib/api/types'

const CATEGORIES = [
  'rent', 'utilities', 'salaries', 'supplies', 'marketing',
  'transport', 'maintenance', 'equipment', 'taxes', 'insurance',
  'food', 'software', 'other',
]

// Define the schema with explicit typing
const schema = z.object({
  description: z.string().min(1, 'Required'),
  amount: z.preprocess(
    v => (v === '' || v === undefined || v === null ? undefined : Number(v)),
    z.number().min(1, 'Must be > 0')
  ),
  expense_type: z.enum(['opex', 'capex']),
  category: z.string().min(1, 'Required'),
  expense_date: z.string().min(1, 'Required'),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess?: () => void
  editing?: Expense | null
}

export default function AddExpenseModal({ open, onOpenChange, onSuccess, editing }: Props) {
  const qc = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any, // Type assertion to bypass inference issues
    defaultValues: {
      expense_date: new Date().toISOString().split('T')[0],
      expense_type: 'opex',
    },
  })

  // Pre-fill form when editing
  useEffect(() => {
    if (editing) {
      reset({
        description: editing.description,
        amount: editing.amount / 100,
        expense_type: (editing.expense_type as 'opex' | 'capex') ?? 'opex',
        category: editing.category,
        expense_date: editing.expense_date.split('T')[0],
      })
    } else {
      reset({
        expense_date: new Date().toISOString().split('T')[0],
        expense_type: 'opex',
      })
    }
  }, [editing, reset])

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        description: data.description,
        amount: Math.round(data.amount * 100), // naira → kobo
        expense_type: data.expense_type,
        category: data.category,
        expense_date: data.expense_date,
      }
      return editing
        ? updateExpense(editing.id, payload)
        : createExpense(payload)
    },
    onSuccess: () => {
      toast.success(editing ? 'Expense updated!' : 'Expense recorded!')
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['expense-summary'] })
      reset()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to save expense'),
  })

  if (!open) return null

  const inputCls = 'w-full h-10 rounded-xl bg-dash-bg border border-dash-border px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative w-full sm:max-w-lg bg-dash-surface border border-dash-border rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-dash-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{editing ? 'Edit Expense' : 'Record Expense'}</h2>
              <p className="text-xs text-muted-foreground">Track your business spending</p>
            </div>
          </div>
          <button onClick={() => onOpenChange(false)} className="p-2 rounded-xl hover:bg-dash-hover text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Description</label>
            <input {...register('description')} placeholder="e.g. Office rent, Diesel, Staff salary" className={inputCls} />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Amount (₦)</label>
              <input type="number" {...register('amount')} placeholder="0" className={inputCls} />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Date</label>
              <input type="date" {...register('expense_date')} className={inputCls} />
              {errors.expense_date && <p className="text-xs text-red-500 mt-1">{errors.expense_date.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Type</label>
              <select {...register('expense_type')} className={inputCls + ' cursor-pointer'}>
                <option value="opex">OpEx (Operating)</option>
                <option value="capex">CapEx (Capital)</option>
              </select>
              {errors.expense_type && <p className="text-xs text-red-500 mt-1">{errors.expense_type.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Category</label>
              <select {...register('category')} className={inputCls + ' capitalize cursor-pointer'}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c} className="capitalize">
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-dash-border bg-dash-bg rounded-b-3xl shrink-0 flex justify-end gap-3">
          <button onClick={() => onOpenChange(false)} className="px-5 py-2.5 rounded-xl font-medium text-sm border border-dash-border text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button
            onClick={() => handleSubmit(d => mutation.mutate(d))()}
            disabled={mutation.isPending}
            className="px-8 py-2.5 rounded-xl font-semibold text-white text-sm disabled:opacity-50 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
          >
            {mutation.isPending ? 'Saving…' : editing ? 'Update' : 'Record Expense'}
          </button>
        </div>
      </div>
    </div>
  )
}