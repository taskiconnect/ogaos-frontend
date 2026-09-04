'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { X, TimerReset } from 'lucide-react'
import { toast } from 'sonner'
import { extendAdminBusinessSubscription } from '@/lib/api/admin'

// ─── Schema ───────────────────────────────────────────────────────────────────

const formSchema = z.object({
  days: z.coerce
    .number()
    .int()
    .min(1, 'Must be at least 1 day')
    .max(3650, 'Too many days'),
})

type FormValues = z.infer<typeof formSchema>

const inputCls =
  'w-full h-10 rounded-xl bg-dash-bg border border-dash-border px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  businessId: string
  businessName: string
  currentPeriodEnd: string | null
  onSuccess?: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExtendSubscriptionModal({
  open,
  onOpenChange,
  businessId,
  businessName,
  currentPeriodEnd,
  onSuccess,
}: Props) {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: { days: 14 },
  })

  useEffect(() => {
    if (!open) reset({ days: 14 })
  }, [open, reset])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => extendAdminBusinessSubscription(businessId, values.days),
    onSuccess: () => {
      toast.success('Subscription extended.')
      onSuccess?.()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to extend subscription.')
    },
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative w-full max-w-md mx-4 bg-dash-surface border border-dash-border rounded-3xl shadow-2xl p-6 space-y-5">

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <TimerReset className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Extend Subscription</h3>
              <p className="text-xs text-muted-foreground">{businessName}</p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 rounded-lg hover:bg-dash-hover text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          Pushes the current period end forward. Plan and limits stay the same.
          {currentPeriodEnd && (
            <>
              {' '}Current period ends{' '}
              <span className="font-semibold text-white">
                {new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(
                  new Date(currentPeriodEnd)
                )}
              </span>.
            </>
          )}
        </p>

        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Extend by (days)
          </label>
          <input type="number" min={1} {...register('days')} placeholder="14" className={inputCls} />
          {errors.days && <p className="text-xs text-red-500 mt-1">{errors.days.message}</p>}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit(d => mutation.mutate(d))()}
            disabled={mutation.isPending}
            className="flex-1 h-10 rounded-xl font-semibold text-white text-sm disabled:opacity-50 transition-all active:scale-95 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
          >
            {mutation.isPending ? 'Extending…' : 'Extend'}
          </button>
        </div>

      </div>
    </div>
  )
}
