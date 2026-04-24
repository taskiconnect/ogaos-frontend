// src/components/settings/BusinessAvatar.tsx
'use client'

import { useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Camera, Loader2 } from 'lucide-react'
import { uploadBusinessLogo } from '@/lib/api/business'
import type { Business } from '@/lib/api/types'

export default function BusinessAvatar({ business }: { business: Business }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  const uploadMut = useMutation({
    mutationFn: (file: File) => uploadBusinessLogo(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
  })

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadMut.mutate(file)
  }

  return (
    <div
      className="relative w-20 h-20 group cursor-pointer"
      onClick={() => fileRef.current?.click()}
    >
      {business.logo_url ? (
        <img
          src={business.logo_url}
          alt="Logo"
          className="w-20 h-20 rounded-2xl object-cover border border-white/10"
        />
      ) : (
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="text-3xl font-bold text-primary">
            {business.name[0]?.toUpperCase()}
          </span>
        </div>
      )}

      <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        {uploadMut.isPending ? (
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        ) : (
          <Camera className="w-5 h-5 text-white" />
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}