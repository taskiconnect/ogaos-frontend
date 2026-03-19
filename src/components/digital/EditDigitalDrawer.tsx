'use client'

// src/components/digital/EditDigitalDrawer.tsx

import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  updateDigitalProduct,
  addDigitalProductGalleryImage,
  removeDigitalProductGalleryImage,
} from '@/lib/api/digital'
import { X, Loader2, ImagePlus, Trash2, AlertTriangle, Link, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DigitalProduct, UpdateDigitalProductRequest } from '@/lib/api/types'

interface Props {
  product: DigitalProduct
  onClose: () => void
  onSuccess: () => void
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

function parseGallery(raw: string): string[] {
  try { return JSON.parse(raw) } catch { return [] }
}

const ALLOWED_VIDEO_HOSTS = ['youtube.com', 'youtu.be', 'vimeo.com', 'drive.google.com']
function isValidVideoUrl(url: string): boolean {
  if (!url.trim()) return true
  try {
    const h = new URL(url).hostname
    return ALLOWED_VIDEO_HOSTS.some(d => h === d || h.endsWith(`.${d}`))
  } catch { return false }
}

export default function EditDigitalDrawer({ product: p, onClose, onSuccess }: Props) {
  const qc = useQueryClient()

  // Edit fields
  const [title,       setTitle]       = useState(p.title)
  const [description, setDescription] = useState(p.description)
  const [price,       setPrice]       = useState(String(p.price / 100))
  const [promoUrl,    setPromoUrl]    = useState(p.promo_video_url ?? '')
  const [videoTouched, setVideoTouched] = useState(false)
  const [saveError,   setSaveError]   = useState('')

  // Gallery
  const [uploading,   setUploading]   = useState(false)
  const [galleryErr,  setGalleryErr]  = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const gallery = parseGallery(p.gallery_image_urls)

  // Expiry info
  const expiresAt = p.expires_at
  const daysLeft = expiresAt
    ? Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000)
    : null

  // Save metadata mutation
  const saveMut = useMutation({
    mutationFn: (d: UpdateDigitalProductRequest) => updateDigitalProduct(p.id, d),
    onSuccess: () => onSuccess(),
    onError: (e: any) => setSaveError(e?.response?.data?.message ?? 'Update failed'),
  })

  // Remove gallery image mutation
  const removeMut = useMutation({
    mutationFn: (index: number) => removeDigitalProductGalleryImage(p.id, index),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['digital-products'] }),
    onError: () => setGalleryErr('Failed to remove image'),
  })

  async function handleGalleryUpload(file: File) {
    setGalleryErr('')
    if (gallery.length >= 3) { setGalleryErr('Maximum 3 gallery images allowed'); return }
    if (!file.type.startsWith('image/')) { setGalleryErr('Only image files are allowed (jpg, png, webp)'); return }
    if (file.size > 5 * 1024 * 1024) { setGalleryErr('Image must be under 5 MB'); return }
    setUploading(true)
    try {
      await addDigitalProductGalleryImage(p.id, file)
      qc.invalidateQueries({ queryKey: ['digital-products'] })
    } catch (e: any) {
      setGalleryErr(e?.response?.data?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleSave() {
    setSaveError('')
    if (!title.trim()) { setSaveError('Title is required'); return }
    if (!promoUrl.trim() || isValidVideoUrl(promoUrl)) {
      saveMut.mutate({
        title:           title.trim(),
        description:     description.trim(),
        price:           Math.round(parseFloat(price) * 100),
        promo_video_url: promoUrl.trim() || undefined,
      })
    } else {
      setSaveError('Video must be a YouTube, Vimeo, or Google Drive link')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:w-120 h-full bg-[#0f0f14] border-l border-white/10 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-lg font-bold">Edit Product</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Expiry warning */}
          {daysLeft !== null && daysLeft <= 30 && (
            <div className={cn(
              'flex items-start gap-2 rounded-xl px-4 py-3 text-xs border',
              daysLeft <= 0
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
            )}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  {daysLeft <= 0
                    ? 'This product has expired and been unpublished'
                    : `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
                </p>
                <p className="mt-0.5 opacity-80">
                  Products are automatically unpublished after 6 months to manage storage.
                </p>
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-white/2 border border-white/5 rounded-xl p-3 text-center">
              <p className="text-gray-500 mb-0.5">Sales</p>
              <p className="text-white font-bold text-base">{p.sales_count}</p>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-center">
              <p className="text-gray-500 mb-0.5">Revenue</p>
              <p className="text-emerald-400 font-bold">
                ₦{(p.total_revenue / 100).toLocaleString('en-NG', { minimumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-white/2 border border-white/5 rounded-xl p-3 text-center">
              <p className="text-gray-500 mb-0.5">Expires</p>
              <p className="text-white font-semibold text-xs">{expiresAt ? fmtDate(expiresAt) : '—'}</p>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/25"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none resize-none"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Price (₦)</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
            />
          </div>

          {/* Promo video — link only */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Promo Video (link only)
            </label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={promoUrl}
                onChange={e => { setPromoUrl(e.target.value); setVideoTouched(false) }}
                onBlur={() => setVideoTouched(true)}
                placeholder="https://youtube.com/watch?v=..."
                className={cn(
                  'w-full bg-white/5 border rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors',
                  videoTouched && promoUrl && !isValidVideoUrl(promoUrl)
                    ? 'border-red-500/40'
                    : 'border-white/10 focus:border-white/25'
                )}
              />
            </div>
            {videoTouched && promoUrl && !isValidVideoUrl(promoUrl) ? (
              <p className="text-xs text-red-400 mt-1.5">Only YouTube, Vimeo, or Google Drive links allowed</p>
            ) : (
              <p className="text-xs text-gray-600 mt-1.5">Supported: YouTube · Vimeo · Google Drive</p>
            )}
          </div>

          {/* Gallery — up to 3 images */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Gallery Images ({gallery.length}/3)
              </label>
              {gallery.length < 3 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                >
                  {uploading
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                    : <><ImagePlus className="w-3.5 h-3.5" /> Add image</>
                  }
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) handleGalleryUpload(f)
                  e.target.value = ''
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {gallery.map((url: string, i: number) => (
                <div key={url}
                  className="relative group aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10">
                  <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeMut.mutate(i)}
                    disabled={removeMut.isPending}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    {removeMut.isPending
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <Trash2 className="w-3 h-3" />
                    }
                  </button>
                  <span className="absolute bottom-1 left-1 text-[10px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded-full">
                    {i + 1}
                  </span>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: Math.max(0, 3 - gallery.length) }).map((_, i) => (
                <button
                  key={`slot-${i}`}
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-primary disabled:opacity-50"
                >
                  <ImagePlus className="w-5 h-5" />
                  <span className="text-[10px]">Add</span>
                </button>
              ))}
            </div>

            {galleryErr && (
              <p className="text-xs text-red-400 mt-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {galleryErr}
              </p>
            )}
          </div>

          {/* File info */}
          {p.file_size && (
            <p className="text-xs text-gray-500">
              File: <span className="text-white">{(p.file_size / 1_000_000).toFixed(2)} MB</span>
              {p.file_mime_type && (
                <span className="ml-2 text-gray-600">({p.file_mime_type})</span>
              )}
            </p>
          )}

          {saveError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {saveError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={handleSave}
            disabled={saveMut.isPending}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
          >
            {saveMut.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              : 'Save Changes'
            }
          </button>
        </div>

      </div>
    </div>
  )
}
