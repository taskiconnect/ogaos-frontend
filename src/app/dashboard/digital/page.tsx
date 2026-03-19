'use client'

import { useState, useMemo, useRef } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listDigitalProducts, deleteDigitalProduct, updateDigitalProduct, uploadDigitalFile, uploadDigitalCover } from '@/lib/api/digital'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { Plus, ShoppingBag, ChevronDown, Trash2, Eye, EyeOff, Upload, Image, Loader2, Pencil, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DigitalProduct } from '@/lib/api/types'
import CreateDigitalModal from '@/components/digital/CreateDigitalModal'
import EditDigitalDrawer from '@/components/digital/EditDigitalDrawer'

function fmt(kobo: number) {
  const n = kobo / 100
  if (n >= 1_000_000) return `₦${(n/1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `₦${(n/1_000).toFixed(0)}k`
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}
function fmtBytes(bytes: number | null) {
  if (!bytes) return null
  if (bytes >= 1_000_000) return `${(bytes/1_000_000).toFixed(1)} MB`
  if (bytes >= 1_000)     return `${(bytes/1_000).toFixed(0)} KB`
  return `${bytes} B`
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl p-5">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

export default function DigitalProductsPage() {
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [selected,   setSelected]   = useState<DigitalProduct | null>(null)
  const [deleting,   setDeleting]   = useState<string | null>(null)
  const [uploading,  setUploading]  = useState<string | null>(null)
  const fileRef  = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['digital-products'],
    queryFn: ({ pageParam }) => listDigitalProducts({ limit: 20, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: any) => last.next_cursor ?? undefined,
  })

  const allProducts: DigitalProduct[] = useMemo(
    () => (data?.pages ?? []).flatMap((p: any) => p.data ?? []), [data]
  )

  const publishedCount = allProducts.filter(p => p.is_published).length
  const totalSales     = allProducts.reduce((s, p) => s + p.sales_count, 0)
  const totalRevenue   = allProducts.reduce((s, p) => s + p.total_revenue, 0)

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteDigitalProduct(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['digital-products'] }); setDeleting(null) },
  })
  const togglePublishMut = useMutation({
    mutationFn: ({ id, val }: { id: string; val: boolean }) => updateDigitalProduct(id, { is_published: val }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['digital-products'] }),
  })
  const uploadFileMut = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadDigitalFile(id, file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['digital-products'] }); setUploading(null) },
    onError: () => setUploading(null),
  })
  const uploadCoverMut = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadDigitalCover(id, file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['digital-products'] }); setUploading(null) },
    onError: () => setUploading(null),
  })

  return (
    <div className="min-h-screen bg-background text-white">
      <Sidebar />
      <div className="lg:pl-72">
        <DashboardHeader />
        <main className="p-6 lg:p-10 space-y-8 pb-20">

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Digital Products</h1>
              <p className="text-gray-400 mt-1 text-sm">Sell files, courses, templates and more</p>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
              <Plus className="w-4 h-4" /> New Product
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <MiniStat label="Published"     value={String(publishedCount)} color="text-emerald-400" />
            <MiniStat label="Total Sales"   value={String(totalSales)}     color="text-blue-400" />
            <MiniStat label="Total Revenue" value={fmt(totalRevenue)}      color="text-white" />
          </div>

          {isLoading ? (
            <div className="p-10 text-center text-gray-500 text-sm">Loading products...</div>
          ) : allProducts.length === 0 ? (
            <div className="p-16 flex flex-col items-center text-center bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl">
              <ShoppingBag className="w-10 h-10 text-gray-600 mb-3" />
              <p className="text-gray-400 font-medium">No digital products yet</p>
              <p className="text-gray-600 text-sm mt-1">Create your first digital product to start selling</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {allProducts.map(product => (
                <div key={product.id} className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl overflow-hidden flex flex-col">

                  {/* Cover image */}
                  <div className="relative h-40 bg-white/[0.02] flex items-center justify-center group">
                    {product.cover_image_url ? (
                      <img src={product.cover_image_url} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-12 h-12 text-gray-600" />
                    )}
                    <button
                      onClick={() => { setActiveUploadId(product.id); coverRef.current?.click() }}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs text-white font-semibold">
                      {uploading === product.id + '-cover' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Image className="w-4 h-4" /> Change Cover</>}
                    </button>
                    <span className={cn('absolute top-2 right-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border',
                      product.is_published ? 'bg-emerald-500/80 text-white border-emerald-400' : 'bg-black/60 text-gray-400 border-white/20')}>
                      {product.is_published ? 'Live' : 'Draft'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white line-clamp-1">{product.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 capitalize">{product.type}</p>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{product.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-white">{fmt(product.price)}</span>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{product.sales_count} sold</p>
                        {product.file_size && <p className="text-xs text-gray-600">{fmtBytes(product.file_size)}</p>}
                      </div>
                    </div>

                    {/* File upload status */}
                    <div className="flex items-center justify-between text-xs">
                      <span className={cn('font-medium', product.file_size ? 'text-emerald-400' : 'text-yellow-400')}>
                        {product.file_size ? 'File uploaded' : 'No file yet'}
                      </span>
                      <button
                        onClick={() => { setActiveUploadId(product.id); fileRef.current?.click() }}
                        className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                        {uploading === product.id + '-file' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        {product.file_size ? 'Replace' : 'Upload'}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 p-3 border-t border-white/5">
                    <button onClick={() => setSelected(product)}
                      className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => togglePublishMut.mutate({ id: product.id, val: !product.is_published })}
                      disabled={togglePublishMut.isPending}
                      className={cn('flex-1 py-2 rounded-lg border text-xs font-semibold transition-colors flex items-center justify-center gap-1',
                        product.is_published
                          ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20')}>
                      {product.is_published ? <><EyeOff className="w-3 h-3" /> Unpublish</> : <><Eye className="w-3 h-3" /> Publish</>}
                    </button>
                    {deleting === product.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => deleteMut.mutate(product.id)}
                          className="px-2 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-xs text-red-400 font-semibold">Yes</button>
                        <button onClick={() => setDeleting(null)}
                          className="px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleting(product.id)}
                        className="w-9 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

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

      {/* Hidden file inputs */}
      <input ref={fileRef} type="file" className="hidden"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f && activeUploadId) { setUploading(activeUploadId + '-file'); uploadFileMut.mutate({ id: activeUploadId, file: f }) }
        }} />
      <input ref={coverRef} type="file" accept="image/*" className="hidden"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f && activeUploadId) { setUploading(activeUploadId + '-cover'); uploadCoverMut.mutate({ id: activeUploadId, file: f }) }
        }} />

      <CreateDigitalModal open={showCreate} onOpenChange={setShowCreate}
        onSuccess={() => qc.invalidateQueries({ queryKey: ['digital-products'] })} />
      {selected && (
        <EditDigitalDrawer product={selected} onClose={() => setSelected(null)}
          onSuccess={() => { qc.invalidateQueries({ queryKey: ['digital-products'] }); setSelected(null) }} />
      )}
    </div>
  )
}
