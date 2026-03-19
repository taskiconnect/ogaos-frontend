'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createDigitalProduct, updateDigitalProduct } from '@/lib/api/digital'
import { X, Loader2 } from 'lucide-react'
import type { DigitalProduct, CreateDigitalProductRequest, UpdateDigitalProductRequest } from '@/lib/api/types'

// ─── Create Modal ─────────────────────────────────────────────────────────────

interface CreateProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess: () => void
}

const PRODUCT_TYPES = [
  'E-book', 'Course', 'Template', 'Software', 'Audio', 'Video', 'Design Asset', 'Other',
]

export function CreateDigitalModal({ open, onOpenChange, onSuccess }: CreateProps) {
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [type,        setType]        = useState('E-book')
  const [price,       setPrice]       = useState('')
  const [promoUrl,    setPromoUrl]    = useState('')
  const [error,       setError]       = useState('')

  function reset() { setTitle(''); setDescription(''); setType('E-book'); setPrice(''); setPromoUrl(''); setError('') }

  const mut = useMutation({
    mutationFn: (d: CreateDigitalProductRequest) => createDigitalProduct(d),
    onSuccess: () => { onSuccess(); onOpenChange(false); reset() },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed to create'),
  })

  function handleSubmit() {
    setError('')
    if (!title.trim())       { setError('Title is required'); return }
    if (!description.trim()) { setError('Description is required'); return }
    if (!price || parseFloat(price) <= 0) { setError('Price is required'); return }
    mut.mutate({
      title: title.trim(), description: description.trim(), type,
      price: Math.round(parseFloat(price) * 100),
      promo_video_url: promoUrl.trim() || undefined,
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative w-full sm:max-w-lg bg-[#0f0f14] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold">New Digital Product</h2>
          <button onClick={() => onOpenChange(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Complete Business Plan Template"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Type</label>
            <select value={type} onChange={e => setType(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none">
              {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="What will the buyer get? What problem does it solve?"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Price (₦) *</label>
            <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Promo Video URL (optional)</label>
            <input value={promoUrl} onChange={e => setPromoUrl(e.target.value)} placeholder="https://youtube.com/..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
          </div>
          <p className="text-xs text-gray-500 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
            After creating, upload your file and cover image from the products list.
            OgaOS takes a 5% platform fee on each sale.
          </p>
          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}
          <button onClick={handleSubmit} disabled={mut.isPending}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
            {mut.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateDigitalModal

// ─── Edit Drawer ──────────────────────────────────────────────────────────────

interface EditProps {
  product: DigitalProduct
  onClose: () => void
  onSuccess: () => void
}

export function EditDigitalDrawer({ product: p, onClose, onSuccess }: EditProps) {
  const [title,       setTitle]       = useState(p.title)
  const [description, setDescription] = useState(p.description)
  const [price,       setPrice]       = useState(String(p.price / 100))
  const [promoUrl,    setPromoUrl]    = useState(p.promo_video_url ?? '')
  const [error,       setError]       = useState('')

  const mut = useMutation({
    mutationFn: (d: UpdateDigitalProductRequest) => updateDigitalProduct(p.id, d),
    onSuccess: () => { onSuccess() },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Update failed'),
  })

  function handleSave() {
    setError('')
    if (!title.trim()) { setError('Title is required'); return }
    mut.mutate({
      title: title.trim(), description: description.trim(),
      price: Math.round(parseFloat(price) * 100),
      promo_video_url: promoUrl.trim() || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:w-[440px] h-full bg-[#0f0f14] border-l border-white/10 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold">Edit Product</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/25" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Price (₦)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Promo Video URL</label>
            <input value={promoUrl} onChange={e => setPromoUrl(e.target.value)} placeholder="https://youtube.com/..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 space-y-1 text-xs text-gray-400">
            <p>Sales: <span className="text-white font-semibold">{p.sales_count}</span></p>
            <p>Revenue (your share): <span className="text-emerald-400 font-semibold">
              ₦{(p.total_revenue/100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </span></p>
            {p.file_size && <p>File size: <span className="text-white">{(p.file_size / 1_000_000).toFixed(2)} MB</span></p>}
          </div>
          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}
        </div>
        <div className="p-4 border-t border-white/10">
          <button onClick={handleSave} disabled={mut.isPending}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
            {mut.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
