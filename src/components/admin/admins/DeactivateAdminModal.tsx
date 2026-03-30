'use client'

import { UserX, X } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import type { AdminProfile } from '@/types/admin'

interface Props {
  admin: AdminProfile
  onConfirm: () => void
  onClose: () => void
  isPending: boolean
}

export default function DeactivateAdminModal({ admin, onConfirm, onClose, isPending }: Props) {
  const displayName = `${admin.first_name} ${admin.last_name}`.trim()

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-dash-surface border border-dash-border rounded-2xl shadow-2xl p-6 space-y-4">

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <UserX className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Deactivate Admin</h3>
              <p className="text-xs text-muted-foreground">{admin.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-dash-hover text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Admin mini-card */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/10">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)' }}
          >
            {getInitials(displayName)}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{displayName}</p>
            <p className="text-xs text-muted-foreground capitalize">{admin.role.replace('_', ' ')}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Deactivating this admin will{' '}
          <span className="font-semibold text-white">immediately revoke all active sessions</span>{' '}
          and prevent them from logging in. Their account and activity history will be preserved.
          You can reactivate them at any time.
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
            className="flex-1 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-sm font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Deactivating…' : 'Yes, Deactivate'}
          </button>
        </div>

      </div>
    </div>
  )
}