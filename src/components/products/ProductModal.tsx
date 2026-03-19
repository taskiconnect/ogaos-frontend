'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createProduct, updateProduct } from '@/lib/api/business'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product, CreateProductRequest, UpdateProductRequest } from '@/lib/api/types'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess: () => void
  editing?: Product | null
}

export default function ProductModal({ open, onOpenChange, onSuccess, editing }: Props) {
  const [name,          setName]          = useState('')
  const [description,   setDescription]   = useState('')
  const [type,          setType]          = useState<'product'|'service'>('product')
  const [sku,           setSku]           = useState('')
  const [price,         setPrice]         = useState('')
  const [costPrice,     setCostPrice]     = useState('')
  const [trackInv,      setTrackInv]      = useState(true)
  const [stockQty,      setStockQty]      = useState('0')
  const [lowThreshold,  setLowThreshold]  = useState('5')
  const [isActive,      setIsActive]      = useState(true)
  const [error,         setError]         = useState('')

  useEffect(() => {
    if (editing) {
      setName(editing.name); setDescription(editing.description ?? '')
      setType(editing.type as 'product'|'service'); setSku(editing.sku ?? '')
      setPrice(String(editing.price / 100))
      setCostPrice(editing.cost_price ? String(editing.cost_price / 100) : '')
      setTrackInv(editing.track_inventory); setStockQty(String(editing.stock_quantity))
      setLowThreshold(String(editing.low_stock_threshold)); setIsActive(editing.is_active)
    } else {
      setName(''); setDescription(''); setType('product'); setSku('')
      setPrice(''); setCostPrice(''); setTrackInv(true); setStockQty('0'); setLowThreshold('5'); setIsActive(true)
    }
    setError('')
  }, [editing, open])

  const createMut = useMutation({
    mutationFn: (d: CreateProductRequest) => createProduct(d),
    onSuccess: () => { onSuccess(); onOpenChange(false) },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed to save'),
  })
  const updateMut = useMutation({
    mutationFn: (d: UpdateProductRequest) => updateProduct(editing!.id, d),
    onSuccess: () => { onSuccess(); onOpenChange(false) },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed to update'),
  })

  function handleSubmit() {
    setError('')
    if (!name.trim()) { setError('Name is required'); return }
    if (!price || parseFloat(price) <= 0) { setError('Price is required'); return }

    if (editing) {
      updateMut.mutate({
        name: name.trim(), description: description.trim() || undefined,
        sku: sku.trim() || undefined,
        price: Math.round(parseFloat(price) * 100),
        cost_price: costPrice ? Math.round(parseFloat(costPrice) * 100) : undefined,
        track_inventory: trackInv, low_stock_threshold: parseInt(lowThreshold) || 5,
        is_active: isActive,
      })
    } else {
      createMut.mutate({
        name: name.trim(), description: description.trim() || undefined, type,
        sku: sku.trim() || undefined,
        price: Math.round(parseFloat(price) * 100),
        cost_price: costPrice ? Math.round(parseFloat(costPrice) * 100) : undefined,
        track_inventory: trackInv,
        stock_quantity: trackInv ? parseInt(stockQty) || 0 : undefined,
        low_stock_threshold: parseInt(lowThreshold) || 5,
      })
    }
  }

  const isPending = createMut.isPending || updateMut.isPending
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative w-full sm:max-w-lg max-h-[95vh] overflow-y-auto bg-[#0f0f14] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl">

        <div className="sticky top-0 bg-[#0f0f14] flex items-center justify-between px-6 py-4 border-b border-white/10 z-10">
          <h2 className="text-lg font-bold">{editing ? 'Edit Product' : 'New Product'}</h2>
          <button onClick={() => onOpenChange(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Type toggle */}
          {!editing && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Type</label>
              <div className="flex gap-2">
                {(['product','service'] as const).map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize border transition-all',
                      type === t ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20')}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Product name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              placeholder="Brief description..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Selling Price (₦) *</label>
              <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Cost Price (₦)</label>
              <input type="number" min="0" value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">SKU (optional)</label>
            <input value={sku} onChange={e => setSku(e.target.value)} placeholder="e.g. PROD-001"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
          </div>

          {/* Inventory tracking */}
          {type === 'product' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm text-white font-medium">Track inventory</p>
                  <p className="text-xs text-gray-500">Monitor stock levels and get alerts</p>
                </div>
                <button onClick={() => setTrackInv(v => !v)}
                  className={cn('w-10 h-6 rounded-full border transition-all relative shrink-0', trackInv ? 'bg-primary border-primary' : 'bg-white/5 border-white/20')}>
                  <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all', trackInv ? 'left-4' : 'left-0.5')} />
                </button>
              </div>
              {trackInv && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      {editing ? 'Current Stock' : 'Opening Stock'}
                    </label>
                    <input type="number" min="0" value={stockQty} onChange={e => setStockQty(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Low Stock Alert</label>
                    <input type="number" min="0" value={lowThreshold} onChange={e => setLowThreshold(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
                  </div>
                </div>
              )}
            </div>
          )}

          {editing && (
            <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
              <p className="text-sm text-white font-medium">Active</p>
              <button onClick={() => setIsActive(v => !v)}
                className={cn('w-10 h-6 rounded-full border transition-all relative shrink-0', isActive ? 'bg-primary border-primary' : 'bg-white/5 border-white/20')}>
                <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all', isActive ? 'left-4' : 'left-0.5')} />
              </button>
            </div>
          )}

          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

          <button onClick={handleSubmit} disabled={isPending}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editing ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  )
}
