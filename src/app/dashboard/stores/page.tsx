'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listStores, createStore, updateStore, setDefaultStore, deleteStore } from '@/lib/api/business'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { Plus, Store, MapPin, Phone, Star, Pencil, Trash2, Loader2, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Store as StoreType, CreateStoreRequest, UpdateStoreRequest } from '@/lib/api/types'

// ─── Store Form Modal ─────────────────────────────────────────────────────────

interface FormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editing?: StoreType | null
}

function StoreFormModal({ open, onOpenChange, onSuccess, editing }: FormModalProps) {
  const [name, setName]             = useState(editing?.name ?? '')
  const [description, setDescription] = useState(editing?.description ?? '')
  const [street, setStreet]         = useState(editing?.street ?? '')
  const [cityTown, setCityTown]     = useState(editing?.city_town ?? '')
  const [state, setState]           = useState(editing?.state ?? '')
  const [phone, setPhone]           = useState(editing?.phone ?? '')
  const [error, setError]           = useState('')

  const createMut = useMutation({
    mutationFn: (data: CreateStoreRequest) => createStore(data),
    onSuccess: () => { onSuccess(); onOpenChange(false) },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed to create store'),
  })
  const updateMut = useMutation({
    mutationFn: (data: UpdateStoreRequest) => updateStore(editing!.id, data),
    onSuccess: () => { onSuccess(); onOpenChange(false) },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed to update store'),
  })

  function handleSubmit() {
    setError('')
    if (!name.trim()) { setError('Store name is required'); return }
    const data = {
      name: name.trim(),
      description: description.trim() || undefined,
      street: street.trim() || undefined,
      city_town: cityTown.trim() || undefined,
      state: state.trim() || undefined,
      phone: phone.trim() || undefined,
    }
    if (editing) updateMut.mutate(data)
    else createMut.mutate(data)
  }

  const isPending = createMut.isPending || updateMut.isPending

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative w-full sm:max-w-lg bg-[#0f0f14] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">{editing ? 'Edit Store' : 'New Store'}</h2>
          <button onClick={() => onOpenChange(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Store Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Main Branch, Ikeja Store"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Street</label>
              <input value={street} onChange={e => setStreet(e.target.value)} placeholder="123 Main Street"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">City / Town</label>
              <input value={cityTown} onChange={e => setCityTown(e.target.value)} placeholder="Lagos"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">State</label>
              <input value={state} onChange={e => setState(e.target.value)} placeholder="Lagos"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
            </div>
          </div>

          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

          <button onClick={handleSubmit} disabled={isPending}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editing ? 'Save Changes' : 'Create Store'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StoresPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState<StoreType | null>(null)
  const [deleting, setDeleting]   = useState<string | null>(null)

  const { data: stores, isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: listStores,
  })

  const defaultMut = useMutation({
    mutationFn: (id: string) => setDefaultStore(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stores'] }),
  })
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteStore(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stores'] }); setDeleting(null) },
  })

  return (
    <div className="min-h-screen bg-background text-white">
      <Sidebar />
      <div className="lg:pl-72">
        <DashboardHeader />
        <main className="p-6 lg:p-10 space-y-8 pb-20">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Stores</h1>
              <p className="text-gray-400 mt-1 text-sm">Manage your business locations</p>
            </div>
            <button onClick={() => { setEditing(null); setShowForm(true) }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
              <Plus className="w-4 h-4" /> Add Store
            </button>
          </div>

          {/* Stores grid */}
          {isLoading ? (
            <div className="text-center py-20 text-gray-500 text-sm">Loading stores...</div>
          ) : !stores?.length ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Store className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-lg font-semibold text-white mb-1">No stores yet</p>
              <p className="text-gray-500 text-sm mb-6">Add your first store location to get started</p>
              <button onClick={() => setShowForm(true)}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
                Add First Store
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {stores.map(store => (
                <div key={store.id}
                  className={cn('bg-[rgba(255,255,255,0.03)] border rounded-2xl p-5 flex flex-col gap-4 transition-all',
                    store.is_default ? 'border-primary/40' : 'border-white/10')}>

                  {/* Card header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center shrink-0',
                        store.is_default ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-white/10')}>
                        <Store className={cn('w-5 h-5', store.is_default ? 'text-primary' : 'text-gray-400')} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white truncate">{store.name}</p>
                          {store.is_default && (
                            <span className="shrink-0 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        {store.description && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">{store.description}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  {(store.street || store.city_town || store.state) && (
                    <div className="flex items-start gap-2 text-xs text-gray-400">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-500" />
                      <span>{[store.street, store.city_town, store.state].filter(Boolean).join(', ')}</span>
                    </div>
                  )}

                  {store.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Phone className="w-3.5 h-3.5 shrink-0 text-gray-500" />
                      <span>{store.phone}</span>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span className={cn('text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border',
                      store.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20')}>
                      {store.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1 border-t border-white/5">
                    {!store.is_default && (
                      <button onClick={() => defaultMut.mutate(store.id)} disabled={defaultMut.isPending}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold text-primary border border-primary/20 hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5">
                        <Star className="w-3 h-3" /> Set Default
                      </button>
                    )}
                    <button onClick={() => { setEditing(store); setShowForm(true) }}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold text-gray-300 border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    {!store.is_default && (
                      <button onClick={() => setDeleting(store.id)}
                        className="w-9 py-2 rounded-xl text-xs text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Delete confirm */}
                  {deleting === store.id && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <p className="text-xs text-red-300 mb-3">Delete <strong>{store.name}</strong>? This cannot be undone.</p>
                      <div className="flex gap-2">
                        <button onClick={() => setDeleting(null)}
                          className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 transition-colors">
                          Cancel
                        </button>
                        <button onClick={() => deleteMut.mutate(store.id)} disabled={deleteMut.isPending}
                          className="flex-1 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-xs text-red-400 font-semibold hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1">
                          {deleteMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} Delete
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      <StoreFormModal
        open={showForm}
        onOpenChange={setShowForm}
        editing={editing}
        onSuccess={() => qc.invalidateQueries({ queryKey: ['stores'] })}
      />
    </div>
  )
}
