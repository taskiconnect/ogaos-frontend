'use client'

import { useState } from 'react'
import { X, Phone, Mail, MapPin, FileText, ShoppingCart, TrendingUp, AlertTriangle, Pencil } from 'lucide-react'
import type { Customer } from '@/lib/api/types'
import CustomerModal from './CustomerModal'

interface Props {
  customer: Customer
  onClose: () => void
  onSuccess: () => void
}

function fmt(kobo: number) {
  const n = kobo / 100
  if (n >= 1_000_000) return `₦${(n/1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `₦${(n/1_000).toFixed(0)}k`
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}
function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-NG', { day:'numeric', month:'short', year:'numeric' }).format(new Date(iso))
}

const AVATAR_COLORS = [
  'bg-blue-500/20 text-blue-400', 'bg-purple-500/20 text-purple-400',
  'bg-emerald-500/20 text-emerald-400', 'bg-orange-500/20 text-orange-400',
  'bg-pink-500/20 text-pink-400',
]

export default function CustomerDrawer({ customer: c, onClose, onSuccess }: Props) {
  const [showEdit, setShowEdit] = useState(false)

  const color = AVATAR_COLORS[c.id.charCodeAt(0) % AVATAR_COLORS.length]
  const initials = `${c.first_name[0] ?? ''}${c.last_name[0] ?? ''}`.toUpperCase()

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative w-full sm:w-[440px] h-full bg-[#0f0f14] border-l border-white/10 flex flex-col overflow-y-auto">

          <div className="sticky top-0 bg-[#0f0f14] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-bold">Customer Profile</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowEdit(true)}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 flex items-center justify-center">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 space-y-6">

            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold border border-white/10 ${color}`}>
                {initials}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{c.first_name} {c.last_name}</h3>
                <p className="text-sm text-gray-400">Customer since {fmtDate(c.created_at)}</p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</h4>
              {c.phone_number && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="text-white">{c.phone_number}</span>
                </div>
              )}
              {c.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="text-white truncate">{c.email}</span>
                </div>
              )}
              {c.address && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                  <span className="text-white">{c.address}</span>
                </div>
              )}
              {!c.phone_number && !c.email && !c.address && (
                <p className="text-sm text-gray-500">No contact details added</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-center">
                <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-emerald-400">{fmt(c.total_purchases)}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Revenue</p>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 text-center">
                <ShoppingCart className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-blue-400">{c.total_orders}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Orders</p>
              </div>
              <div className={`border rounded-xl p-3 text-center ${c.outstanding_debt > 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-white/[0.02] border-white/10'}`}>
                <AlertTriangle className={`w-4 h-4 mx-auto mb-1 ${c.outstanding_debt > 0 ? 'text-red-400' : 'text-gray-500'}`} />
                <p className={`text-sm font-bold ${c.outstanding_debt > 0 ? 'text-red-400' : 'text-gray-500'}`}>{fmt(c.outstanding_debt)}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Debt</p>
              </div>
            </div>

            {/* Notes */}
            {c.notes && (
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</h4>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 flex items-start gap-2">
                  <FileText className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300">{c.notes}</p>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${c.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                {c.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

          </div>
        </div>
      </div>

      <CustomerModal open={showEdit} onOpenChange={setShowEdit} editing={c}
        onSuccess={() => { onSuccess(); setShowEdit(false) }} />
    </>
  )
}
