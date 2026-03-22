'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listProducts, deleteProduct } from '@/lib/api/business'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { Plus, Search, Package, Trash2, ChevronDown, AlertTriangle, Image } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/api/types'
import ProductModal from '@/components/products/ProductModal'
import ProductDrawer from '@/components/products/ProductDrawer'

function fmt(kobo: number) {
  const n = kobo / 100
  if (n >= 1_000_000) return `₦${(n/1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `₦${(n/1_000).toFixed(0)}k`
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

const TYPE_FILTERS = ['', 'product', 'service'] as const

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl p-5">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

export default function ProductsPage() {
  const qc = useQueryClient()
  const [search, setSearch]         = useState('')
  const [typeFilter, setTypeFilter] = useState<'' | 'product' | 'service'>('')
  const [lowStock, setLowStock]     = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected]     = useState<Product | null>(null)
  const [deleting, setDeleting]     = useState<string | null>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['products', typeFilter, search, lowStock],
    queryFn: ({ pageParam }) => listProducts({
      limit: 30, cursor: pageParam as string | undefined,
      type: typeFilter || undefined,
      search: search || undefined,
      low_stock: lowStock || undefined,
    }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: any) => last.next_cursor ?? undefined,
  })

  const allProducts: Product[] = useMemo(
    () => (data?.pages ?? []).flatMap((p: any) => p.data ?? []), [data]
  )

  const physicalCount = allProducts.filter(p => p.type === 'product').length
  const serviceCount  = allProducts.filter(p => p.type === 'service').length
  const lowStockCount = allProducts.filter(p => p.track_inventory && p.stock_quantity <= p.low_stock_threshold).length
  const totalValue    = allProducts.reduce((s, p) => s + p.price, 0)

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setDeleting(null) },
  })

  return (
    <div className="min-h-screen bg-background text-white">
      <Sidebar />
      <div className="lg:pl-72">
        <DashboardHeader />
        <main className="p-6 lg:p-10 space-y-8 pb-20">

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Products & Services</h1>
              <p className="text-gray-400 mt-1 text-sm">Manage your inventory and service catalogue</p>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MiniStat label="Products"      value={String(physicalCount)} color="text-white" />
            <MiniStat label="Services"      value={String(serviceCount)}  color="text-blue-400" />
            <MiniStat label="Low Stock"     value={String(lowStockCount)} color={lowStockCount > 0 ? 'text-yellow-400' : 'text-gray-500'} />
            <MiniStat label="Avg. Price"    value={allProducts.length ? fmt(Math.round(totalValue / allProducts.length)) : '₦0'} color="text-emerald-400" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25" />
            </div>
            <div className="flex gap-2">
              {TYPE_FILTERS.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={cn('px-3 py-2 rounded-xl text-xs font-semibold border capitalize transition-all',
                    typeFilter === t ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20')}>
                  {t || 'All'}
                </button>
              ))}
              <button onClick={() => setLowStock(v => !v)}
                className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all',
                  lowStock ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20')}>
                <AlertTriangle className="w-3.5 h-3.5" /> Low stock
              </button>
            </div>
          </div>

          <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="p-10 text-center text-gray-500 text-sm">Loading products...</div>
            ) : allProducts.length === 0 ? (
              <div className="p-16 flex flex-col items-center text-center">
                <Package className="w-10 h-10 text-gray-600 mb-3" />
                <p className="text-gray-400 font-medium">No products yet</p>
                <p className="text-gray-600 text-sm mt-1">Add your first product or service</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {allProducts.map(product => {
                  const isLow = product.track_inventory && product.stock_quantity <= product.low_stock_threshold
                  return (
                    <div key={product.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                      {/* Image or placeholder */}
                      <button onClick={() => setSelected(product)}
                        className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                        {product.image_url
                          ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          : <Package className="w-5 h-5 text-gray-500" />
                        }
                      </button>

                      {/* Info */}
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelected(product)}>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white truncate">{product.name}</p>
                          <span className={cn('text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border shrink-0',
                            product.type === 'service'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-purple-500/10 text-purple-400 border-purple-500/20')}>
                            {product.type}
                          </span>
                        </div>
                        {product.sku && <p className="text-xs text-gray-500 mt-0.5">SKU: {product.sku}</p>}
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-white">{fmt(product.price)}</p>
                        {product.cost_price && (
                          <p className="text-xs text-gray-500">Cost: {fmt(product.cost_price)}</p>
                        )}
                      </div>

                      {/* Stock */}
                      {product.track_inventory && (
                        <div className={cn('text-right shrink-0 hidden sm:block', isLow ? 'text-yellow-400' : 'text-gray-400')}>
                          <p className="text-sm font-semibold">{product.stock_quantity}</p>
                          <p className="text-[10px]">{isLow ? 'Low stock' : 'in stock'}</p>
                        </div>
                      )}

                      {/* Status */}
                      <span className={cn('hidden lg:block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border shrink-0',
                        product.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20')}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>

                      {/* Delete */}
                      {deleting === product.id ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => deleteMut.mutate(product.id)}
                            className="px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-xs text-red-400 font-semibold">Confirm</button>
                          <button onClick={() => setDeleting(null)}
                            className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={e => { e.stopPropagation(); setDeleting(product.id) }}
                          className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center shrink-0 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {hasNextPage && (
            <div className="text-center">
              <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10">
                <ChevronDown className="w-4 h-4" />{isFetchingNextPage ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}

        </main>
      </div>

      <ProductModal open={showCreate} onOpenChange={setShowCreate}
        onSuccess={() => qc.invalidateQueries({ queryKey: ['products'] })} />
      {selected && (
        <ProductDrawer product={selected} onClose={() => setSelected(null)}
          onSuccess={() => { qc.invalidateQueries({ queryKey: ['products'] }); setSelected(null) }} />
      )}
    </div>
  )
}
