'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listStaff, inviteStaff, deactivateStaff } from '@/lib/api/business'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { UserPlus, Users, UserX, Check, X, Loader2, Mail, Phone, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StaffMember, InviteStaffRequest } from '@/lib/api/types'

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

// Resolve a field from nested user object OR flat on member.
// Handles both API shapes: { user: { first_name } } and { first_name } directly.
function resolve(member: StaffMember, field: string): string {
  const u = member.user as any
  const m = member as any
  return u?.[field] || m[field] || ''
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────

function InviteModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess: () => void
}) {
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [phone,     setPhone]     = useState('')
  const [password,  setPassword]  = useState('')
  const [jobTitle,  setJobTitle]  = useState('')
  const [department, setDepartment] = useState('')
  const [error,     setError]     = useState('')

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
    onSuccess: () => { onSuccess(); onOpenChange(false); reset() },
    onError: (e: any) => setError(e?.message ?? 'Failed to invite staff'),
  })

  function handleSubmit() {
    setError('')
    if (!firstName.trim()) { setError('First name is required'); return }
    if (!email.trim())     { setError('Email is required'); return }
    if (!password)         { setError('Password is required'); return }
    mut.mutate()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative w-full sm:max-w-lg bg-[#0f0f14] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold">Invite Staff Member</h2>
          <button onClick={() => onOpenChange(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">First Name *</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Emeka"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Last Name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Okafor"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="emeka@yourbusiness.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Job Title</label>
              <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Cashier"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Department</label>
              <input value={department} onChange={e => setDepartment(e.target.value)} placeholder="Sales"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Temporary Password *</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="They can change this later"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
          </div>
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3 text-xs text-blue-300">
            Staff members can access sales, customers, and products but cannot change business settings.
          </div>
          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}
          <button onClick={handleSubmit} disabled={mut.isPending}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
            {mut.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending invite...</> : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StaffPage() {
  const qc = useQueryClient()
  const [showInvite, setShowInvite] = useState(false)
  const [confirming, setConfirming] = useState<string | null>(null)

  const { data, isLoading } = useQuery({ queryKey: ['staff'], queryFn: () => listStaff() })
  const staff: StaffMember[] = Array.isArray(data) ? data : []

  const activeStaff   = staff.filter(s => s.is_active)
  const inactiveStaff = staff.filter(s => !s.is_active)

  const deactivateMut = useMutation({
    mutationFn: (id: string) => deactivateStaff(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); setConfirming(null) },
  })

  return (
    <div className="min-h-screen bg-background text-white">
      <Sidebar />
      <div className="lg:pl-72">
        <DashboardHeader />
        <main className="p-6 lg:p-10 space-y-8 pb-20 max-w-4xl">

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
              <p className="text-gray-400 mt-1 text-sm">Invite and manage your team members</p>
            </div>
            <button onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
              <UserPlus className="w-4 h-4" /> Invite Staff
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl p-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Active</p>
              <p className="text-2xl font-bold text-emerald-400">{activeStaff.length}</p>
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl p-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Total</p>
              <p className="text-2xl font-bold text-white">{staff.length}</p>
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl p-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Inactive</p>
              <p className="text-2xl font-bold text-gray-500">{inactiveStaff.length}</p>
            </div>
          </div>

          {/* Staff list */}
          {isLoading ? (
            <div className="p-10 text-center text-gray-500 text-sm">Loading staff...</div>
          ) : staff.length === 0 ? (
            <div className="p-16 flex flex-col items-center text-center bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl">
              <Users className="w-10 h-10 text-gray-600 mb-3" />
              <p className="text-gray-400 font-medium">No staff members yet</p>
              <p className="text-gray-600 text-sm mt-1">Invite your first team member to get started</p>
              <button onClick={() => setShowInvite(true)}
                className="mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
                Invite Staff
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {staff.map(member => {
                // resolve() checks member.user.field first, then member.field directly
                const firstName   = resolve(member, 'first_name')
                const lastName    = resolve(member, 'last_name')
                const email       = resolve(member, 'email')
                const phoneNumber = resolve(member, 'phone_number')
                const displayName = (firstName || lastName)
                  ? `${firstName} ${lastName}`.trim()
                  : email || '—'
                const initials = firstName?.[0]?.toUpperCase() ?? email?.[0]?.toUpperCase() ?? '?'

                return (
                  <div key={member.id}
                    className={cn('bg-[rgba(255,255,255,0.03)] border rounded-2xl p-5 flex items-start gap-4',
                      member.is_active ? 'border-white/10' : 'border-white/5 opacity-60')}>

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-base font-bold text-primary">{initials}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-white">{displayName}</p>
                        {member.job_title && (
                          <span className="text-[10px] text-gray-500">{member.job_title}</span>
                        )}
                        <span className={cn('text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border',
                          member.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-gray-500/10 text-gray-500 border-gray-500/20')}>
                          {member.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        {email && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Mail className="w-3 h-3 text-gray-500" />{email}
                          </div>
                        )}
                        {phoneNumber && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Phone className="w-3 h-3 text-gray-500" />{phoneNumber}
                          </div>
                        )}
                        {member.department && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <span className="text-gray-500">Dept:</span> {member.department}
                          </div>
                        )}
                        {member.joined_at && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />Joined {fmtDate(member.joined_at)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {member.is_active && (
                      <div className="shrink-0">
                        {confirming === member.id ? (
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-400">Deactivate?</p>
                            <button onClick={() => deactivateMut.mutate(member.id)} disabled={deactivateMut.isPending}
                              className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 flex items-center justify-center">
                              {deactivateMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            </button>
                            <button onClick={() => setConfirming(null)}
                              className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-gray-400 flex items-center justify-center">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirming(member.id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 hover:bg-red-500/20 transition-colors font-semibold">
                            <UserX className="w-3.5 h-3.5" /> Deactivate
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Permissions info */}
          <div className="bg-white/2 border border-white/10 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">Staff Permissions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {([
                ['Record sales', true], ['View customers', true], ['Add customers', true],
                ['View products', true], ['Adjust stock', true], ['View invoices', true],
                ['Record expenses', true], ['Record debt payments', true],
                ['Change business settings', false], ['Delete records', false],
                ['View financial reports', false], ['Manage other staff', false],
              ] as [string, boolean][]).map(([label, allowed]) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={cn('w-4 h-4 rounded-full flex items-center justify-center shrink-0',
                    allowed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>
                    {allowed ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                  </div>
                  <span className={allowed ? 'text-gray-300' : 'text-gray-500'}>{label}</span>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>

      <InviteModal
        open={showInvite}
        onOpenChange={setShowInvite}
        onSuccess={() => qc.invalidateQueries({ queryKey: ['staff'] })}
      />
    </div>
  )
}