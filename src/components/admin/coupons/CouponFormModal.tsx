'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { X, TicketPercent, Tag, Calendar, Percent, Hash, AlignLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import api from '@/lib/api/adminClient'
import type { Coupon } from '@/app/admin/dashboard/coupons/page'

// ─── Schema ───────────────────────────────────────────────────────────────────

const PLANS = ['starter', 'growth', 'pro', 'enterprise']

const formSchema = z.object({
  code:             z.string().min(2, 'Code is required').max(32),
  description:      z.string().optional(),
  discount_value:   z.coerce.number().int().min(1).max(100, 'Max 100%'),
  applicable_plans: z.array(z.string()).min(1, 'Select at least one plan'),
  starts_at:        z.string().min(1, 'Start date required'),
  expires_at:       z.string().min(1, 'Expiry date required'),
  max_redemptions:  z.coerce.number().int().min(0),
})

type FormValues = z.infer<typeof formSchema>

// ─── API ──────────────────────────────────────────────────────────────────────

async function createCoupon(payload: FormValues): Promise<void> {
  await api.post('/api/admin/coupons', {
    ...payload,
    // Convert local datetime-local value to RFC3339
    starts_at:  new Date(payload.starts_at).toISOString(),
    expires_at: new Date(payload.expires_at).toISOString(),
  })
}

async function updateCoupon(id: string, payload: Partial<FormValues>): Promise<void> {
  await api.patch(`/api/admin/coupons/${id}`, {
    ...payload,
    ...(payload.starts_at  ? { starts_at:  new Date(payload.starts_at).toISOString()  } : {}),
    ...(payload.expires_at ? { expires_at: new Date(payload.expires_at).toISOString() } : {}),
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Convert ISO string → value for <input type="datetime-local">
function toDatetimeLocal(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const inputCls =
  'w-full h-10 rounded-xl bg-dash-bg border border-dash-border px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  coupon?: Coupon | null       // if provided → edit mode
  onSuccess?: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CouponFormModal({ open, onOpenChange, coupon, onSuccess }: Props) {
  const isEdit = !!coupon

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      code:             '',
      description:      '',
      discount_value:   10,
      applicable_plans: [],
      starts_at:        '',
      expires_at:       '',
      max_redemptions:  0,
    },
  })

  // Populate form on edit
  useEffect(() => {
    if (coupon) {
      reset({
        code:             coupon.code,
        description:      coupon.description ?? '',
        discount_value:   coupon.discount_value,
        applicable_plans: coupon.applicable_plans,
        starts_at:        toDatetimeLocal(coupon.starts_at),
        expires_at:       toDatetimeLocal(coupon.expires_at),
        max_redemptions:  coupon.max_redemptions,
      })
    } else {
      reset({
        code:             '',
        description:      '',
        discount_value:   10,
        applicable_plans: [],
        starts_at:        '',
        expires_at:       '',
        max_redemptions:  0,
      })
    }
  }, [coupon, open, reset])

  const watchPlans = watch('applicable_plans')

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      isEdit ? updateCoupon(coupon!.id, values) : createCoupon(values),
    onSuccess: () => {
      toast.success(isEdit ? 'Coupon updated.' : 'Coupon created.')
      onSuccess?.()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Something went wrong.')
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
              <TicketPercent className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {isEdit ? 'Edit Coupon' : 'Create Coupon'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isEdit ? `Editing ${coupon!.code}` : 'New discount code'}
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

          {/* Code */}
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5 block">
              <Hash className="w-3 h-3" /> Coupon Code
            </label>
            <input
              {...register('code')}
              placeholder="e.g. LAUNCH50"
              className={cn(inputCls, 'font-mono uppercase tracking-widest')}
            />
            {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5 block">
              <AlignLeft className="w-3 h-3" /> Description (optional)
            </label>
            <input
              {...register('description')}
              placeholder="e.g. Launch discount for early adopters"
              className={inputCls}
            />
          </div>

          {/* Discount value */}
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5 block">
              <Percent className="w-3 h-3" /> Discount Percentage
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={100}
                {...register('discount_value')}
                className={cn(inputCls, 'pr-8')}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
            </div>
            {errors.discount_value && (
              <p className="text-xs text-red-500 mt-1">{errors.discount_value.message}</p>
            )}
          </div>

          {/* Applicable plans */}
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 block">
              <Tag className="w-3 h-3" /> Applicable Plans
            </label>
            <Controller
              control={control}
              name="applicable_plans"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {PLANS.map(plan => {
                    const selected = field.value.includes(plan)
                    return (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => {
                          field.onChange(
                            selected
                              ? field.value.filter((p: string) => p !== plan)
                              : [...field.value, plan]
                          )
                        }}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-all',
                          selected
                            ? 'bg-primary/15 border-primary/30 text-primary'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                        )}
                      >
                        {plan}
                      </button>
                    )
                  })}
                </div>
              )}
            />
            {errors.applicable_plans && (
              <p className="text-xs text-red-500 mt-1">{errors.applicable_plans.message}</p>
            )}
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5 block">
                <Calendar className="w-3 h-3" /> Starts At
              </label>
              <input
                type="datetime-local"
                {...register('starts_at')}
                className={inputCls}
              />
              {errors.starts_at && (
                <p className="text-xs text-red-500 mt-1">{errors.starts_at.message}</p>
              )}
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5 block">
                <Calendar className="w-3 h-3" /> Expires At
              </label>
              <input
                type="datetime-local"
                {...register('expires_at')}
                className={inputCls}
              />
              {errors.expires_at && (
                <p className="text-xs text-red-500 mt-1">{errors.expires_at.message}</p>
              )}
            </div>
          </div>

          {/* Max redemptions */}
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Max Redemptions
              <span className="ml-1 text-gray-500 font-normal normal-case tracking-normal">
                — 0 means unlimited
              </span>
            </label>
            <input
              type="number"
              min={0}
              {...register('max_redemptions')}
              className={inputCls}
            />
            {errors.max_redemptions && (
              <p className="text-xs text-red-500 mt-1">{errors.max_redemptions.message}</p>
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
              disabled={mutation.isPending}
              className="flex-1 h-10 rounded-xl font-semibold text-white text-sm disabled:opacity-50 transition-all active:scale-95 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
            >
              {mutation.isPending
                ? isEdit ? 'Saving…' : 'Creating…'
                : isEdit ? 'Save Changes' : 'Create Coupon'
              }
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}