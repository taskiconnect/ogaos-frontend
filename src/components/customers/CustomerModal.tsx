'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createCustomer, updateCustomer } from '@/lib/api/business'
import { X, Loader2 } from 'lucide-react'
import type { Customer, CreateCustomerRequest } from '@/lib/api/types'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess: () => void
  editing?: Customer | null
}

export default function CustomerModal({ open, onOpenChange, onSuccess, editing }: Props) {
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [phone,     setPhone]     = useState('')
  const [address,   setAddress]   = useState('')
  const [notes,     setNotes]     = useState('')
  const [error,     setError]     = useState('')

  useEffect(() => {
    if (editing) {
      setFirstName(editing.first_name); setLastName(editing.last_name)
      setEmail(editing.email ?? '');    setPhone(editing.phone_number ?? '')
      setAddress(editing.address ?? ''); setNotes(editing.notes ?? '')
    } else {
      setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setAddress(''); setNotes('')
    }
    setError('')
  }, [editing, open])

  const createMut = useMutation({
    mutationFn: (d: CreateCustomerRequest) => createCustomer(d),
    onSuccess: () => { onSuccess(); onOpenChange(false) },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed to save'),
  })
  const updateMut = useMutation({
    mutationFn: (d: CreateCustomerRequest) => updateCustomer(editing!.id, d),
    onSuccess: () => { onSuccess(); onOpenChange(false) },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed to update'),
  })

  function handleSubmit() {
    setError('')
    if (!firstName.trim()) { setError('First name is required'); return }
    if (!lastName.trim())  { setError('Last name is required');  return }
    const payload: CreateCustomerRequest = {
      first_name: firstName.trim(), last_name: lastName.trim(),
      email: email.trim() || undefined, phone_number: phone.trim() || undefined,
      address: address.trim() || undefined, notes: notes.trim() || undefined,
    }
    editing ? updateMut.mutate(payload) : createMut.mutate(payload)
  }

  const isPending = createMut.isPending || updateMut.isPending
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative w-full sm:max-w-lg bg-[#0f0f14] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl">

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold">{editing ? 'Edit Customer' : 'New Customer'}</h2>
          <button onClick={() => onOpenChange(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">First Name *</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Emeka"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Last Name *</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Okafor"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="emeka@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Address</label>
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Herbert Macaulay Way, Lagos"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any notes about this customer..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none resize-none" />
          </div>

          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

          <button onClick={handleSubmit} disabled={isPending}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editing ? 'Save Changes' : 'Add Customer'}
          </button>
        </div>
      </div>
    </div>
  )
}
