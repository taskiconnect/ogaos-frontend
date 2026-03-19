'use client'

// src/components/shared/GalleryUpload.tsx
// Reusable 3-image gallery upload component used in:
//  - Digital product edit drawer
//  - Business settings storefront section

import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ImagePlus, X, Loader2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/lib/api/client'

interface Props {
  images:        string[]          // current image URLs
  uploadUrl:     string            // e.g. /digital-products/:id/gallery
  deleteUrl:     (i: number) => string  // e.g. /digital-products/:id/gallery/0
  onSuccess:     () => void        // refetch parent query
  maxImages?:    number            // default 3
  label?:        string
}

export default function GalleryUpload({
  images, uploadUrl, deleteUrl, onSuccess, maxImages = 3, label = 'Gallery Images',
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState('')

  const deleteMut = useMutation({
    mutationFn: (index: number) => api.delete(deleteUrl(index)),
    onSuccess,
    onError: () => setError('Failed to remove image'),
  })

  async function handleUpload(file: File) {
    setError('')
    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }
    // Validate type client-side
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed (jpg, png, webp)')
      return
    }
    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB')
      return
    }
    setUploading(true)
    const form = new FormData()
    form.append('image', file)
    try {
      await api.post(uploadUrl, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      onSuccess()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {label} ({images.length}/{maxImages})
        </label>
        {images.length < maxImages && (
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
          onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = '' }}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2">
        {images.map((url, i) => (
          <div key={url} className="relative group aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10">
            <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => deleteMut.mutate(i)}
              disabled={deleteMut.isPending}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
            >
              {deleteMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
            </button>
            <span className="absolute bottom-1 left-1 text-[10px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded-full">
              {i + 1}
            </span>
          </div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: Math.max(0, maxImages - images.length) }).map((_, i) => (
          <button
            key={`empty-${i}`}
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

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  )
}
