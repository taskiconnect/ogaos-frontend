'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSale } from '@/lib/api/finance'
import { listCustomers, listProducts } from '@/lib/api/business'
import {
  X, Plus, Trash2, ShoppingCart, Search,
  UserPlus, User, Phone, Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Customer } from '@/lib/api/types'

// ─── Validation schema (all money in NAIRA on form) ───────────────────────────

const itemSchema = z.object({
  product_id:   z.string().optional(),
  product_name: z.string().min(1, 'Item name required'),
  unit_price:   z.coerce.number().min(0.01, 'Price must be > 0'),  // naira
  quantity:     z.coerce.number().int().min(1, 'Min qty is 1'),
  discount:     z.coerce.number().min(0).default(0),                // naira
})

const formSchema = z.object({
  customer_id:        z.string().optional(),
  walk_in_first_name: z.string().optional(),
  walk_in_last_name:  z.string().optional(),
  walk_in_phone:      z.string().optional(),
  walk_in_email:      z.string().optional(),
  staff_name:         z.string().optional(),
  payment_method:     z.string().min(1, 'Required'),
  amount_paid:        z.coerce.number().min(0).default(0),    // naira
  discount_amount:    z.coerce.number().min(0).default(0),    // naira
  notes:              z.string().optional(),
  send_receipt_email: z.boolean().default(false),
  items:              z.array(itemSchema).min(1, 'Add at least one item'),
})

type FormValues = z.infer<typeof formSchema>

const PAYMENT_METHODS = ['cash', 'transfer', 'pos', 'card', 'cheque', 'credit']

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess?: () => void
}

// ─── Customer search dropdown ─────────────────────────────────────────────────

interface CustomerPickerProps {
  customers: Customer[]
  onSelect: (c: Customer) => void
  onAddNew: (prefill: string) => void
}

function CustomerPicker({ customers, onSelect, onAddNew }: CustomerPickerProps) {
  const [q, setQ]     = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const filtered = customers
    .filter(c => {
      const lq = q.toLowerCase()
      return (
        c.first_name.toLowerCase().includes(lq) ||
        c.last_name.toLowerCase().includes(lq) ||
        (c.phone_number ?? '').includes(lq)
      )
    })
    .slice(0, 8)

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search by name or phone…"
          className="w-full h-10 pl-9 pr-4 rounded-xl bg-dash-bg border border-dash-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 z-20 bg-dash-surface border border-dash-border rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
          {filtered.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => { onSelect(c); setQ(''); setOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-dash-hover text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-[11px] font-bold text-primary uppercase">
                {c.first_name[0]}{c.last_name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{c.first_name} {c.last_name}</p>
                {c.phone_number && <p className="text-xs text-muted-foreground">{c.phone_number}</p>}
              </div>
            </button>
          ))}

          {/* Always show "Add new" option */}
          <button
            type="button"
            onClick={() => { setOpen(false); onAddNew(q) }}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-emerald-500/5 text-left border-t border-dash-border transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {q ? `Add "${q}" as new customer` : 'Add new customer'}
            </p>
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function RecordSaleModal({ open, onOpenChange, onSuccess }: Props) {
  const qc = useQueryClient()
  const [customerMode, setCustomerMode] = useState<'none' | 'existing' | 'new'>('none')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [productSearch, setProductSearch] = useState<string[]>([])

  const { data: customersData } = useQuery({
    queryKey: ['customers-picker'],
    queryFn:  () => listCustomers({ limit: 500 }),
    enabled:  open,
    staleTime: 30_000,
  })
  const { data: productsData } = useQuery({
    queryKey: ['products-picker'],
    queryFn:  () => listProducts({ limit: 500 }),
    enabled:  open,
    staleTime: 30_000,
  })

  const customers = customersData?.data ?? []
  const products  = productsData?.data  ?? []

  const {
    register, control, handleSubmit, watch, setValue, reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [{ product_name: '', unit_price: 0, quantity: 1, discount: 0 }],
      payment_method: 'cash',
      amount_paid: 0,
      discount_amount: 0,
      send_receipt_email: false,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const watchItems         = watch('items')
  const watchAmountPaid    = watch('amount_paid') ?? 0
  const watchDiscountAmt   = watch('discount_amount') ?? 0
  const watchSendEmail     = watch('send_receipt_email')

  // Live totals in naira
  const subtotal = watchItems.reduce((s, i) =>
    s + (Number(i.unit_price) * Number(i.quantity)) - Number(i.discount ?? 0), 0)
  const total    = Math.max(0, subtotal - Number(watchDiscountAmt))
  const balance  = Math.max(0, total - Number(watchAmountPaid))

  function doReset() {
    reset()
    setCustomerMode('none')
    setSelectedCustomer(null)
    setProductSearch([])
  }

  const mutation = useMutation({
    mutationFn: (vals: FormValues) => {
      // Build walk-in block only when mode is 'new'
      const walkIn = customerMode === 'new' && vals.walk_in_first_name && vals.walk_in_phone
        ? {
            first_name: vals.walk_in_first_name.trim(),
            last_name:  (vals.walk_in_last_name ?? '').trim(),
            phone:      vals.walk_in_phone.trim(),
            email:      vals.walk_in_email?.trim() || undefined,
          }
        : undefined

      return createSale({
        customer_id:        vals.customer_id || undefined,
        walk_in_customer:   walkIn,
        staff_name:         vals.staff_name?.trim() || undefined,
        payment_method:     vals.payment_method,
        // Convert naira → kobo for API
        amount_paid:        Math.round(Number(vals.amount_paid) * 100),
        discount_amount:    Math.round(Number(vals.discount_amount ?? 0) * 100),
        notes:              vals.notes?.trim() || undefined,
        send_receipt_email: vals.send_receipt_email,
        items: vals.items.map(i => ({
          product_id:   i.product_id || undefined,
          product_name: i.product_name.trim(),
          unit_price:   Math.round(Number(i.unit_price) * 100),    // naira → kobo
          quantity:     Number(i.quantity),
          discount:     Math.round(Number(i.discount ?? 0) * 100), // naira → kobo
        })),
      })
    },
    onSuccess: () => {
      toast.success('Sale recorded!')
      qc.invalidateQueries({ queryKey: ['sales'] })
      qc.invalidateQueries({ queryKey: ['customers-picker'] })
      doReset()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? 'Failed to record sale'),
  })

  if (!open) return null

  const inputCls = 'w-full h-10 rounded-xl bg-dash-bg border border-dash-border px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30'
  const smallCls = 'w-full h-9 rounded-lg bg-dash-surface border border-dash-border px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => { doReset(); onOpenChange(false) }}
      />

      <div className="relative w-full sm:max-w-2xl bg-dash-surface border border-dash-border rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-dash-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Record Sale</h2>
              <p className="text-xs text-muted-foreground">All amounts in Naira (₦)</p>
            </div>
          </div>
          <button
            onClick={() => { doReset(); onOpenChange(false) }}
            className="p-2 rounded-xl hover:bg-dash-hover text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* ── Customer section ── */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Customer
            </label>

            {customerMode === 'none' && (
              <CustomerPicker
                customers={customers}
                onSelect={c => {
                  setSelectedCustomer(c)
                  setValue('customer_id', c.id)
                  setCustomerMode('existing')
                }}
                onAddNew={name => {
                  setCustomerMode('new')
                  const parts = name.trim().split(' ')
                  if (parts[0]) setValue('walk_in_first_name', parts[0])
                  if (parts[1]) setValue('walk_in_last_name', parts.slice(1).join(' '))
                }}
              />
            )}

            {customerMode === 'existing' && selectedCustomer && (
              <div className="flex items-center gap-3 bg-dash-bg rounded-xl border border-emerald-500/30 px-3 py-2.5">
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary uppercase">
                  {selectedCustomer.first_name[0]}{selectedCustomer.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedCustomer.phone_number}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setCustomerMode('none'); setSelectedCustomer(null); setValue('customer_id', '') }}
                  className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  Change
                </button>
              </div>
            )}

            {customerMode === 'new' && (
              <div className="bg-dash-bg rounded-2xl border border-dash-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-foreground">New Customer</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerMode('none')
                      ;(['walk_in_first_name', 'walk_in_last_name', 'walk_in_phone', 'walk_in_email'] as const)
                        .forEach(f => setValue(f, ''))
                    }}
                    className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 -mt-1">
                  This customer will be saved so you can find them by name or phone next time.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">First Name *</label>
                    <input {...register('walk_in_first_name')} placeholder="Ada" className={smallCls} />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Last Name</label>
                    <input {...register('walk_in_last_name')} placeholder="Okonkwo" className={smallCls} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone *
                  </label>
                  <input {...register('walk_in_phone')} placeholder="08012345678" className={smallCls} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email (optional — for email receipts)
                  </label>
                  <input {...register('walk_in_email')} type="email" placeholder="ada@email.com" className={smallCls} />
                </div>
              </div>
            )}
          </div>

          {/* ── Staff + Payment method ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Served By
              </label>
              <input
                {...register('staff_name')}
                placeholder="Staff name"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Payment Method
              </label>
              <select {...register('payment_method')} className={inputCls}>
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Items ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Items
              </label>
              <button
                type="button"
                onClick={() => append({ product_name: '', unit_price: 0, quantity: 1, discount: 0 })}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add item
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, i) => {
                const srch = productSearch[i] ?? ''
                const filteredProds = products
                  .filter(p => p.name.toLowerCase().includes(srch.toLowerCase()))
                  .slice(0, 6)
                const lineTotal = Math.max(
                  0,
                  (Number(watchItems[i]?.unit_price) * Number(watchItems[i]?.quantity)) -
                  Number(watchItems[i]?.discount ?? 0)
                )

                return (
                  <div key={field.id} className="bg-dash-bg rounded-2xl border border-dash-border p-4 space-y-3">
                    {/* Product name with autocomplete */}
                    <div className="relative">
                      <input
                        {...register(`items.${i}.product_name`)}
                        placeholder="Product / service name"
                        onChange={e => {
                          register(`items.${i}.product_name`).onChange(e)
                          const arr = [...productSearch]; arr[i] = e.target.value; setProductSearch(arr)
                          setValue(`items.${i}.product_id`, '')
                        }}
                        className="w-full h-10 rounded-xl bg-dash-surface border border-dash-border px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      {srch.length > 0 && filteredProds.length > 0 && (
                        <div className="absolute top-full mt-1 left-0 right-0 z-10 bg-dash-surface border border-dash-border rounded-xl shadow-xl overflow-hidden">
                          {filteredProds.map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setValue(`items.${i}.product_name`, p.name)
                                setValue(`items.${i}.product_id`, p.id)
                                // p.price is kobo from API → convert to naira for form
                                setValue(`items.${i}.unit_price`, p.price / 100)
                                const arr = [...productSearch]; arr[i] = ''; setProductSearch(arr)
                              }}
                              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-dash-hover text-left text-sm transition-colors"
                            >
                              <span className="text-foreground">{p.name}</span>
                              <span className="text-muted-foreground text-xs">
                                ₦{(p.price / 100).toLocaleString('en-NG')}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      {errors.items?.[i]?.product_name && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.items[i]?.product_name?.message}
                        </p>
                      )}
                    </div>

                    {/* Price / Qty / Discount */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">
                          Price (₦)
                        </label>
                        <input
                          type="number" step="0.01" min="0"
                          {...register(`items.${i}.unit_price`)}
                          className={smallCls}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">
                          Qty
                        </label>
                        <input
                          type="number" min="1"
                          {...register(`items.${i}.quantity`)}
                          className={smallCls}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">
                          Disc. (₦)
                        </label>
                        <input
                          type="number" step="0.01" min="0"
                          {...register(`items.${i}.discount`)}
                          className={smallCls}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Line total:{' '}
                        <span className="font-semibold text-foreground">
                          ₦{lineTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        </span>
                      </span>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(i)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Notes (optional)
            </label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="Any notes for this sale…"
              className="w-full rounded-xl bg-dash-bg border border-dash-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
        </div>

        {/* ── Footer: totals + submit ── */}
        <div className="px-6 pb-6 pt-4 border-t border-dash-border bg-dash-bg rounded-b-3xl shrink-0 space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">
                Overall Discount (₦)
              </label>
              <input type="number" step="0.01" min="0" {...register('discount_amount')} className={smallCls} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">
                Amount Paid Now (₦)
              </label>
              <input type="number" step="0.01" min="0" {...register('amount_paid')} className={smallCls} />
            </div>
          </div>

          {/* Balance warning */}
          {balance > 0 && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0 mt-1.5" />
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                <span className="font-semibold">
                  ₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })} balance
                </span>{' '}
                will be automatically added to this customer's debt records.
              </p>
            </div>
          )}

          {/* Email receipt toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              onClick={() => setValue('send_receipt_email', !watchSendEmail)}
              className={cn(
                'w-9 h-5 rounded-full transition-colors relative shrink-0',
                watchSendEmail ? 'bg-primary' : 'bg-dash-border',
              )}
            >
              <div className={cn(
                'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                watchSendEmail ? 'translate-x-4' : 'translate-x-0.5',
              )} />
            </button>
            <span className="text-xs font-medium text-muted-foreground">
              Email receipt to customer after saving
            </span>
          </label>

          {/* Total + submit button */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Total</p>
              <p className="text-2xl font-bold text-foreground tracking-tight">
                ₦{total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </p>
              {balance > 0 && Number(watchAmountPaid) > 0 && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">
                  Paid: ₦{Number(watchAmountPaid).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleSubmit(d => mutation.mutate(d))}
              disabled={mutation.isPending}
              className="px-8 py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-50 transition-all active:scale-95 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
            >
              {mutation.isPending ? 'Recording…' : 'Record Sale'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
