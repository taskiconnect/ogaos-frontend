'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { UserPlus, X, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const schema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name:  z.string().min(1, 'Required'),
  email:      z.string().email('Valid email required'),
  role:       z.enum(['staff', 'manager']),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export default function AddStaffModal({ open, onOpenChange }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'staff' },
  })

  const onSubmit = (v: FormValues) => {
    toast.success(`Invite sent to ${v.email}`)
    form.reset()
    onOpenChange(false)
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
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Add Staff Member</h2>
              <p className="text-xs text-muted-foreground">They&apos;ll receive an invite email</p>
            </div>
          </div>
          <button onClick={() => onOpenChange(false)} className="w-8 h-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-dash-hover transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>First Name *</label>
              <input className={inp} placeholder="Emeka" {...form.register('first_name')} />
              {form.formState.errors.first_name && <p className="text-xs text-red-500 mt-1">{form.formState.errors.first_name.message}</p>}
            </div>
            <div>
              <label className={lbl}>Last Name *</label>
              <input className={inp} placeholder="Okafor" {...form.register('last_name')} />
              {form.formState.errors.last_name && <p className="text-xs text-red-500 mt-1">{form.formState.errors.last_name.message}</p>}
            </div>
          </div>

          <div>
            <label className={lbl}>Email Address *</label>
            <input type="email" className={inp} placeholder="staff@yourcompany.com" {...form.register('email')} />
            {form.formState.errors.email && <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>}
          </div>

          <div>
            <label className={lbl}>Role *</label>
            <select className={cn(inp, 'cursor-pointer')} {...form.register('role')}>
              <option value="staff">Staff (limited access)</option>
              <option value="manager">Manager (full access)</option>
            </select>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-dash-subtle border border-dash-border">
            <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              The staff member will receive an email invitation to create their OgaOS account and join your business.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-xl border border-dash-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-dash-hover transition-all">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 h-11 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
