'use client'

import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { adjustStock, uploadProductImage } from '@/lib/api/business'
import { X, Package, Plus, Minus, Camera, Loader2, Pencil, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/api/types'
import ProductModal from './ProductModal'

interface Props {
  product: Product
  onClose: () => void
  onSuccess: () => void
}

function fmt(kobo: number) {
  return `₦${(kobo/100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

export default function ProductDrawer({ product: p, onClose, onSuccess }: Props) {
  const [showEdit,      setShowEdit]      = useState(false)
  const [adjAmount,     setAdjAmount]     = useState('')
  const [adjReason,     setAdjReason]     = useState('')
  const [showAdj,       setShowAdj]       = useState(false)
  const [adjType,       setAdjType]       = useState<'add'|'remove'>('add')
  const [error,         setError]         = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const adjMut = useMutation({
    mutationFn: () => adjustStock(p.id, {
      adjustment: adjType === 'add' ? parseInt(adjAmount) : -parseInt(adjAmount),
      reason: adjReason || undefined,
    }),
    onSuccess: () => { onSuccess(); setShowAdj(false); setAdjAmount(''); setAdjReason('') },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed to adjust stock'),
  })

  const imageMut = useMutation({
    mutationFn: (file: File) => uploadProductImage(p.id, file),
    onSuccess: () => onSuccess(),
  })

  const isLow = p.track_inventory && p.stock_quantity <= p.low_stock_threshold

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative w-full sm:w-[440px] h-full bg-[#0f0f14] border-l border-white/10 flex flex-col overflow-y-auto">

          <div className="sticky top-0 bg-[#0f0f14] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-bold">Product Details</h2>
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

            {/* Image + name */}
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-16 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 group cursor-pointer"
                onClick={() => fileRef.current?.click()}>
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  : <Package className="w-7 h-7 text-gray-500 absolute inset-0 m-auto" />
                }
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {imageMut.isPending ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) imageMut.mutate(f) }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white">{p.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border',
                    p.type === 'service' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20')}>
                    {p.type}
                  </span>
                  <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border',
                    p.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20')}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {p.description && <p className="text-sm text-gray-400 mt-2">{p.description}</p>}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pricing</h4>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Selling price</span>
                <span className="text-xl font-bold text-white">{fmt(p.price)}</span>
              </div>
              {p.cost_price && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Cost price</span>
                    <span className="text-sm text-white">{fmt(p.cost_price)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-sm text-gray-400">Margin</span>
                    <span className="text-sm font-semibold text-emerald-400">
                      {fmt(p.price - p.cost_price)} ({(((p.price - p.cost_price) / p.price) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Stock */}
            {p.track_inventory && (
              <div className={cn('border rounded-2xl p-4 space-y-3', isLow ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-white/[0.02] border-white/10')}>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Inventory</h4>
                  {isLow && <span className="flex items-center gap-1 text-xs text-yellow-400 font-semibold"><AlertTriangle className="w-3 h-3" /> Low stock</span>}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Current stock</span>
                  <span className={cn('text-xl font-bold', isLow ? 'text-yellow-400' : 'text-white')}>{p.stock_quantity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Low stock alert at</span>
                  <span className="text-sm text-white">{p.low_stock_threshold}</span>
                </div>

                {!showAdj ? (
                  <button onClick={() => setShowAdj(true)}
                    className="w-full py-2.5 rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/5 transition-colors">
                    Adjust Stock
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {(['add','remove'] as const).map(t => (
                        <button key={t} onClick={() => setAdjType(t)}
                          className={cn('flex-1 py-2 rounded-xl text-xs font-semibold border capitalize transition-all flex items-center justify-center gap-1',
                            adjType === t
                              ? t === 'add' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-red-500/20 border-red-500/40 text-red-400'
                              : 'bg-white/5 border-white/10 text-gray-400')}>
                          {t === 'add' ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />} {t}
                        </button>
                      ))}
                    </div>
                    <input type="number" min="1" value={adjAmount} onChange={e => setAdjAmount(e.target.value)}
                      placeholder="Quantity"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" />
                    <input value={adjReason} onChange={e => setAdjReason(e.target.value)}
                      placeholder="Reason (optional)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none" />
                    {error && <p className="text-xs text-red-400">{error}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => { setShowAdj(false); setAdjAmount(''); setAdjReason(''); setError('') }}
                        className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:bg-white/10">Cancel</button>
                      <button onClick={() => adjMut.mutate()} disabled={adjMut.isPending || !adjAmount}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
                        {adjMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {p.sku && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">SKU</span>
                <span className="font-mono text-gray-300">{p.sku}</span>
              </div>
            )}

          </div>
        </div>
      </div>

      <ProductModal open={showEdit} onOpenChange={setShowEdit} editing={p}
        onSuccess={() => { onSuccess(); setShowEdit(false) }} />
    </>
  )
}
