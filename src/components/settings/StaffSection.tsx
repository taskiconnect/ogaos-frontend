// src/components/settings/StaffSection.tsx
'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Check, Loader2, UserPlus, UserX, X } from 'lucide-react'
import { inviteStaff } from '@/lib/api/business'
import { cn } from '@/lib/utils'
import type { StaffMember, InviteStaffRequest } from '@/lib/api/types'

// ─── StaffRow ─────────────────────────────────────────────────────────────────

export function StaffRow({
  member,
  onDeactivate,
}: {
  member: StaffMember
  onDeactivate: (id: string) => void
}) {
  const [confirm, setConfirm] = useState(false)

  // member.user may be null if the backend doesn't nest the user object.
  // Fall back to reading fields directly on member (flat response shape).
  const user = member.user
  const firstName  = user?.first_name  ?? (member as any).first_name  ?? ''
  const lastName   = user?.last_name   ?? (member as any).last_name   ?? ''
  const email      = user?.email       ?? (member as any).email       ?? ''
  const phone      = user?.phone_number ?? (member as any).phone_number ?? ''

  const initials   = firstName?.[0]?.toUpperCase() ?? '?'
  const displayName = (firstName || lastName)
    ? `${firstName} ${lastName}`.trim()
    : email || '—'

  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-primary">{initials}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{displayName}</p>
        <p className="text-xs text-gray-500 truncate">{email || '—'}</p>
        {phone ? <p className="text-xs text-gray-600 truncate">{phone}</p> : null}
      </div>

      <span
        className={cn(
          'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
          member.is_active
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        )}
      >
        {member.is_active ? 'Active' : 'Inactive'}
      </span>

      {member.is_active && !confirm && (
        <button
          onClick={() => setConfirm(true)}
          className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors"
        >
          <UserX className="w-3.5 h-3.5" />
        </button>
      )}

      {confirm && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDeactivate(member.id)}
            className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 flex items-center justify-center"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-gray-400 flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── AddStaffInline ───────────────────────────────────────────────────────────

export function AddStaffInline({ onSuccess }: { onSuccess: () => void }) {
  const [show, setShow] = useState(false)
  const [firstName,  setFirstName]  = useState('')
  const [lastName,   setLastName]   = useState('')
  const [email,      setEmail]      = useState('')
  const [phone,      setPhone]      = useState('')
  const [password,   setPassword]   = useState('')
  const [jobTitle,   setJobTitle]   = useState('')
  const [department, setDepartment] = useState('')
  const [error, setError] = useState('')

  function reset() {
    setFirstName(''); setLastName(''); setEmail(''); setPhone('')
    setPassword(''); setJobTitle(''); setDepartment(''); setError('')
  }

  const mut = useMutation({
    mutationFn: () => {
      const payload: InviteStaffRequest = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phone,
        password,
      }
      if (jobTitle.trim())   payload.job_title  = jobTitle.trim()
      if (department.trim()) payload.department = department.trim()
      return inviteStaff(payload)
    },
    onSuccess: () => {
      onSuccess()
      setShow(false)
      reset()
    },
    onError: (e: any) => setError(e?.message ?? 'Failed to invite staff'),
  })

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-semibold"
      >
        <UserPlus className="w-4 h-4" />
        Invite Staff Member
      </button>
    )
  }

  return (
    <div className="bg-white/2 border border-white/10 rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-white">Invite New Staff</p>

      <div className="grid grid-cols-2 gap-3">
        <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name"
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none" />
        <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name"
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none" />
      </div>

      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none" />

      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none" />

      <div className="grid grid-cols-2 gap-3">
        <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Job title (optional)"
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none" />
        <input value={department} onChange={e => setDepartment(e.target.value)} placeholder="Department (optional)"
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none" />
      </div>

      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Temporary password" type="password"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none" />

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button onClick={() => { setShow(false); reset() }}
          className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:bg-white/10 transition-colors">
          Cancel
        </button>
        <button onClick={() => mut.mutate()} disabled={mut.isPending || !firstName || !email || !password}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
          {mut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Send Invite
        </button>
      </div>
    </div>
  )
}