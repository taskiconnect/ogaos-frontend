// src/components/settings/StorefrontGallery.tsx
'use client'

import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { addBusinessGalleryImage, removeBusinessGalleryImage, setStorefrontVideo } from '@/lib/api/business'
import type { Business } from '@/lib/api/types'

export default function StorefrontGallery({ business }: { business: Business }) {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [videoUrl, setVideoUrl] = useState((business as any).storefront_video_url ?? '')
  const [videoSaved, setVideoSaved] = useState(false)
  const [galleryErr, setGalleryErr] = useState('')
  const [videoErr, setVideoErr] = useState('')

  const gallery: string[] = (() => {
    try {
      return JSON.parse((business as any).gallery_image_urls ?? '[]')
    } catch {
      return []
    }
  })()

  const removeMut = useMutation({
    mutationFn: (index: number) => removeBusinessGalleryImage(index),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
    onError: () => setGalleryErr('Failed to remove image'),
  })

  const videoMut = useMutation({
    mutationFn: (url: string) => setStorefrontVideo(url),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['business'] })
      setVideoSaved(true)
      setTimeout(() => setVideoSaved(false), 2000)
    },
    onError: () => setVideoErr('Failed to save video link'),
  })

  async function handleImageUpload(file: File) {
    setGalleryErr('')
    if (gallery.length >= 3) { setGalleryErr('Maximum 3 images allowed'); return }
    if (!file.type.startsWith('image/')) { setGalleryErr('Only image files are allowed'); return }
    if (file.size > 5 * 1024 * 1024) { setGalleryErr('Image must be under 5 MB'); return }
    setUploading(true)
    try {
      await addBusinessGalleryImage(file)
      qc.invalidateQueries({ queryKey: ['business'] })
    } catch (e: any) {
      setGalleryErr(e?.response?.data?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function isValidVideoUrl(url: string) {
    if (!url) return true
    try {
      const h = new URL(url).hostname
      return ['youtube.com', 'youtu.be', 'vimeo.com', 'drive.google.com'].some(
        (d) => h === d || h.endsWith(`.${d}`)
      )
    } catch {
      return false
    }
  }

  return (
    <div className="space-y-6">
      {/* Gallery */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-white">Store Gallery</p>
            <p className="text-xs text-gray-400 mt-0.5">Up to 3 photos of your store, team, or workspace</p>
          </div>
          {gallery.length < 3 && (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
              {uploading ? 'Uploading...' : 'Add photo'}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleImageUpload(f)
              e.target.value = ''
            }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {gallery.map((url: string, i: number) => (
            <div key={url} className="relative group aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10">
              <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removeMut.mutate(i)}
                disabled={removeMut.isPending}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                {removeMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 3 - gallery.length) }).map((_, i) => (
            <button
              key={`slot-${i}`}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="aspect-video rounded-xl border-2 border-dashed border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-primary disabled:opacity-50"
            >
              <ImagePlus className="w-5 h-5" />
              <span className="text-[10px]">Add photo</span>
            </button>
          ))}
        </div>
        {galleryErr && <p className="text-xs text-red-400 mt-2">{galleryErr}</p>}
      </div>

      {/* Video */}
      <div>
        <p className="text-sm font-medium text-white mb-1">Storefront Video</p>
        <p className="text-xs text-gray-400 mb-3">Paste a YouTube, Vimeo or Google Drive link — no upload needed</p>
        <div className="flex items-center gap-2">
          <input
            value={videoUrl}
            onChange={(e) => { setVideoUrl(e.target.value); setVideoSaved(false); setVideoErr('') }}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25"
          />
          <button
            onClick={() => {
              if (!isValidVideoUrl(videoUrl)) { setVideoErr('Only YouTube, Vimeo, or Google Drive links'); return }
              videoMut.mutate(videoUrl.trim())
            }}
            disabled={videoMut.isPending}
            className="px-4 py-3 rounded-xl text-sm font-semibold text-white shrink-0 disabled:opacity-50 flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
          >
            {videoMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : videoSaved ? <Check className="w-4 h-4" /> : 'Save'}
          </button>
        </div>
        {videoErr && <p className="text-xs text-red-400 mt-2">{videoErr}</p>}
        {!videoUrl && <p className="text-xs text-gray-600 mt-1.5">Supported: YouTube · Vimeo · Google Drive</p>}
      </div>
    </div>
  )
}