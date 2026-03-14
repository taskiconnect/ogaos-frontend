'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { UserRoundPlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createCustomer } from '@/lib/api/business'

const schema = z.object({
  first_name:   z.string().min(1, 'Required'),
  last_name:    z.string().min(1, 'Required'),
  email:        z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone_number: z.string().optional(),
  address:      z.string().optional(),
  notes:        z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open:        boolean
  onOpenChange: (v: boolean) => void
  onSuccess?:  () => void
}

export default function AddCustomerModal({ open, onOpenChange, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const customer = await createCustomer({
        first_name:   values.first_name,
        last_name:    values.last_name,
        email:        values.email || undefined,
        phone_number: values.phone_number || undefined,
        address:      values.address || undefined,
        notes:        values.notes || undefined,
      })
      toast.success(`${customer.first_name} added to your customers!`)
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to add customer. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  const inp = 'w-full h-10 px-3 rounded-xl bg-dash-subtle border border-dash-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all'
  const lbl = 'block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-md bg-dash-raised border border-dash-border rounded-3xl p-6 shadow-2xl">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <UserRoundPlus className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Add Customer</h2>
              <p className="text-xs text-muted-foreground">Quick-add to your CRM</p>
            </div>
          </div>
          <button onClick={() => onOpenChange(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-dash-hover transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>First Name *</label>
              <input className={inp} placeholder="Emeka" {...form.register('first_name')} />
              {form.formState.errors.first_name && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.first_name.message}</p>
              )}
            </div>
            <div>
              <label className={lbl}>Last Name *</label>
              <input className={inp} placeholder="Okafor" {...form.register('last_name')} />
              {form.formState.errors.last_name && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className={lbl}>Phone Number</label>
            <input className={inp} placeholder="+234 80X XXX XXXX" {...form.register('phone_number')} />
          </div>

          <div>
            <label className={lbl}>Email Address</label>
            <input type="email" className={inp} placeholder="customer@email.com" {...form.register('email')} />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className={lbl}>Address</label>
            <input className={inp} placeholder="Street, city, state" {...form.register('address')} />
          </div>

          <div>
            <label className={lbl}>Notes (optional)</label>
            <textarea rows={2} className={cn(inp, 'h-auto py-2.5 resize-none')}
              placeholder="Any notes about this customer…" {...form.register('notes')} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-xl border border-dash-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-dash-hover transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 h-11 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
              {loading ? 'Adding…' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
