'use client'

import { Trash2, X } from 'lucide-react'
import type { Coupon } from '@/app/admin/dashboard/coupons/page'

interface Props {
  coupon: Coupon
  onConfirm: () => void
  onClose: () => void
  isPending: boolean
}

export default function DeleteCouponModal({ coupon, onConfirm, onClose, isPending }: Props) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-dash-surface border border-dash-border rounded-2xl shadow-2xl p-6 space-y-4">

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Delete Coupon</h3>
              <p className="text-xs text-muted-foreground font-mono tracking-wider">{coupon.code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-dash-hover text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          This will permanently delete the coupon{' '}
          <span className="font-semibold text-foreground font-mono">{coupon.code}</span>.
          It has been redeemed <span className="font-semibold text-foreground">{coupon.redemptions}</span> time
          {coupon.redemptions !== 1 ? 's' : ''}. This action cannot be undone.
        </p>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors"
          >
            Keep Coupon
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-sm font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>

      </div>
    </div>
  )
}