'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { X, Pencil, Crown, Headphones, BadgeDollarSign } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { toast } from 'sonner'
import { updateAdmin } from '@/lib/api/admin'
import type { AdminProfile, AdminRole } from '@/types/admin'

// ─── Schema ───────────────────────────────────────────────────────────────────

const formSchema = z.object({
  role: z.enum(['super_admin', 'support', 'finance']),
})

type FormValues = z.infer<typeof formSchema>

// ─── Role options ─────────────────────────────────────────────────────────────

const ROLES: { value: AdminRole; label: string; description: string; icon: React.ElementType; cls: string }[] = [
  {
    value:       'super_admin',
    label:       'Super Admin',
    description: 'Full access — can invite, edit, and deactivate all admins',
    icon:        Crown,
    cls:         'border-primary/30 bg-primary/10 text-primary',
  },
  {
    value:       'support',
    label:       'Support',
    description: 'Can view users, businesses, analytics, and coupons',
    icon:        Headphones,
    cls:         'border-blue-500/30 bg-blue-500/10 text-blue-400',
  },
  {
    value:       'finance',
    label:       'Finance',
    description: 'Can view analytics and revenue reports',
    icon:        BadgeDollarSign,
    cls:         'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  admin: AdminProfile
  onSuccess?: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditAdminModal({ open, onOpenChange, admin, onSuccess }: Props) {
  const displayName = `${admin.first_name} ${admin.last_name}`.trim()

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: { role: admin.role },
  })

  useEffect(() => {
    reset({ role: admin.role })
  }, [admin, open, reset])

  const watchRole = watch('role')

  const mutation = useMutation({
    mutationFn: (values: FormValues) => updateAdmin(admin.id, values),
    onSuccess: () => {
      toast.success('Admin role updated.')
      onSuccess?.()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to update admin.')
    },
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative w-full max-w-lg mx-4 bg-dash-surface border border-dash-border rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Pencil className="w-4.5 h-4.5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Edit Admin</h3>
              <p className="text-xs text-muted-foreground">Change role for {displayName}</p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-lg hover:bg-dash-hover text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 pb-6 space-y-5">

          {/* Admin mini-card */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/10">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
            >
              {getInitials(displayName)}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{displayName}</p>
              <p className="text-xs text-muted-foreground">{admin.email}</p>
            </div>
          </div>

          {/* Role picker */}
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              New Role
            </label>
            <div className="space-y-2">
              {ROLES.map(r => {
                const Icon = r.icon
                const selected = watchRole === r.value
                const isCurrent = admin.role === r.value
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setValue('role', r.value, { shouldValidate: true })}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all',
                      selected
                        ? r.cls
                        : 'bg-white/3 border-white/10 hover:border-white/20'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      selected ? 'bg-white/10' : 'bg-white/5'
                    )}>
                      <Icon className={cn('w-4 h-4', selected ? '' : 'text-gray-400')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          'text-sm font-semibold',
                          selected ? '' : 'text-gray-300'
                        )}>
                          {r.label}
                        </p>
                        {isCurrent && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full border bg-white/5 border-white/15 text-gray-500">
                            current
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        'text-xs mt-0.5',
                        selected ? 'opacity-80' : 'text-gray-500'
                      )}>
                        {r.description}
                      </p>
                    </div>
                    <div className={cn(
                      'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all',
                      selected ? 'border-current' : 'border-gray-600'
                    )}>
                      {selected && <div className="w-2 h-2 rounded-full bg-current" />}
                    </div>
                  </button>
                )
              })}
            </div>
            {errors.role && (
              <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-dash-border bg-dash-bg rounded-b-3xl shrink-0">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(d => mutation.mutate(d))()}
              disabled={mutation.isPending || watchRole === admin.role}
              className="flex-1 h-10 rounded-xl font-semibold text-white text-sm disabled:opacity-50 transition-all active:scale-95 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
            >
              {mutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}