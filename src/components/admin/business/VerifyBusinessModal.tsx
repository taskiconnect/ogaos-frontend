'use client'

import { BadgeCheck, ShieldOff, X } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import type { AdminBusinessDetail } from '@/types/admin-business'

interface Props {
  business: Pick<AdminBusinessDetail, 'name' | 'slug' | 'is_verified'>
  onConfirm: () => void
  onClose: () => void
  isPending: boolean
}

export default function VerifyBusinessModal({ business, onConfirm, onClose, isPending }: Props) {
  const verifying = !business.is_verified

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-dash-surface border border-dash-border rounded-2xl shadow-2xl p-6 space-y-4">

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                verifying ? 'bg-primary/10 border-primary/20' : 'bg-red-500/10 border-red-500/20'
              }`}
            >
              {verifying
                ? <BadgeCheck className="w-5 h-5 text-primary" />
                : <ShieldOff className="w-5 h-5 text-red-400" />}
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {verifying ? 'Verify Business' : 'Remove Verification'}
              </h3>
              <p className="text-xs text-muted-foreground">/{business.slug}</p>
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
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
          >
            {getInitials(business.name)}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{business.name}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {verifying ? (
            <>
              This adds a <span className="font-semibold text-white">verified badge</span> to the
              business's public profile, signaling it's been reviewed by the platform.
            </>
          ) : (
            <>
              This removes the <span className="font-semibold text-white">verified badge</span> from
              the business's public profile. This does not affect their subscription or account access.
            </>
          )}
        </p>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`flex-1 h-10 rounded-xl border text-sm font-semibold disabled:opacity-50 transition-colors ${
              verifying
                ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
                : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
            }`}
          >
            {isPending ? 'Saving…' : verifying ? 'Yes, Verify' : 'Yes, Remove'}
          </button>
        </div>

      </div>
    </div>
  )
}
