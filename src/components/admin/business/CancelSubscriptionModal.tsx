'use client'

import { getInitials } from '@/lib/utils'
import { Ban, X } from 'lucide-react'

interface Props {
  businessName: string
  onConfirm: () => void
  onClose: () => void
  isPending: boolean
}

export default function CancelSubscriptionModal({
  businessName,
  onConfirm,
  onClose,
  isPending,
}: Props) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-dash-surface border border-dash-border rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <Ban className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Cancel Subscription</h3>
              <p className="text-xs text-muted-foreground">{businessName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-dash-hover text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Business mini-card */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/10">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)' }}
          >
            {getInitials(businessName)}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{businessName}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          This sets the subscription status to{' '}
          <span className="font-semibold text-white">cancelled</span>. The business keeps its
          current plan limits until a new subscription is activated — this does not immediately
          downgrade them to the free tier.
        </p>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors"
          >
            Keep Subscription
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-sm font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Cancelling…' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}
