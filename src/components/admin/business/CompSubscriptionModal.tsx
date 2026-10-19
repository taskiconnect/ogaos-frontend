'use client'

import { compAdminBusinessSubscription } from '@/lib/api/admin'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Gift, Rocket, Sparkles, Sprout, X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

// ─── Schema ───────────────────────────────────────────────────────────────────

const formSchema = z.object({
  plan: z.enum(['free', 'growth', 'pro', 'custom'], {
    error: 'Select a plan', // Zod v4: use `error` not `required_error`
  }),
  duration_days: z.coerce
    .number()
    .int()
    .min(1, 'Must be at least 1 day')
    .max(3650, 'Too many days'),
})

type FormValues = z.infer<typeof formSchema>

// ─── Plan options ─────────────────────────────────────────────────────────────

const PLANS: {
  value: FormValues['plan']
  label: string
  description: string
  icon: React.ElementType
  cls: string
}[] = [
  {
    value: 'free',
    label: 'Free',
    description: 'Default tier — 2 staff, 1 store, 20 products',
    icon: Gift,
    cls: 'border-white/30 bg-white/10 text-gray-200',
  },
  {
    value: 'growth',
    label: 'Growth',
    description: '5 staff, 3 stores, 100 products, debt & expense tracking',
    icon: Sprout,
    cls: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  },
  {
    value: 'pro',
    label: 'Pro',
    description: 'Unlimited stores/products, custom domain, priority support',
    icon: Rocket,
    cls: 'border-primary/30 bg-primary/10 text-primary',
  },
  {
    value: 'custom',
    label: 'Custom',
    description: 'Negotiated limits for enterprise accounts',
    icon: Sparkles,
    cls: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  },
]

const inputCls =
  'w-full h-10 rounded-xl bg-dash-bg border border-dash-border px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  businessId: string
  businessName: string
  onSuccess?: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CompSubscriptionModal({
  open,
  onOpenChange,
  businessId,
  businessName,
  onSuccess,
}: Props) {
  const {
    handleSubmit,
    register,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: { plan: 'growth', duration_days: 30 },
  })

  const watchPlan = watch('plan')

  useEffect(() => {
    if (!open) reset({ plan: 'growth', duration_days: 30 })
  }, [open, reset])

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      compAdminBusinessSubscription(businessId, values.plan, values.duration_days),
    onSuccess: () => {
      toast.success('Subscription granted.')
      onSuccess?.()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to grant subscription.')
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
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Comp a Plan</h3>
              <p className="text-xs text-muted-foreground">
                Grant {businessName} a plan without payment
              </p>
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
          {/* Plan picker */}
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Plan
            </label>
            <div className="space-y-2">
              {PLANS.map((p) => {
                const Icon = p.icon
                const selected = watchPlan === p.value
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setValue('plan', p.value, { shouldValidate: true })}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all',
                      selected ? p.cls : 'bg-white/3 border-white/10 hover:border-white/20',
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                        selected ? 'bg-white/10' : 'bg-white/5',
                      )}
                    >
                      <Icon className={cn('w-4 h-4', selected ? '' : 'text-gray-400')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-semibold', selected ? '' : 'text-gray-300')}>
                        {p.label}
                      </p>
                      <p
                        className={cn('text-xs mt-0.5', selected ? 'opacity-80' : 'text-gray-500')}
                      >
                        {p.description}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all',
                        selected ? 'border-current' : 'border-gray-600',
                      )}
                    >
                      {selected && <div className="w-2 h-2 rounded-full bg-current" />}
                    </div>
                  </button>
                )
              })}
            </div>
            {errors.plan && <p className="text-xs text-red-500 mt-1">{errors.plan.message}</p>}
          </div>

          {/* Duration */}
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Duration (days)
            </label>
            <input
              type="number"
              min={1}
              {...register('duration_days')}
              placeholder="30"
              className={inputCls}
            />
            {errors.duration_days && (
              <p className="text-xs text-red-500 mt-1">{errors.duration_days.message}</p>
            )}
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-2.5 px-3 py-3 rounded-xl bg-primary/5 border border-primary/15">
            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
            <p className="text-xs text-gray-400">
              This replaces any existing subscription immediately — no payment event is recorded.
            </p>
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
              onClick={() => handleSubmit((d) => mutation.mutate(d))()}
              disabled={mutation.isPending}
              className="flex-1 h-10 rounded-xl font-semibold text-white text-sm disabled:opacity-50 transition-all active:scale-95 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
            >
              {mutation.isPending ? 'Granting…' : 'Grant Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
