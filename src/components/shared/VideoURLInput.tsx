'use client'

// src/components/shared/VideoURLInput.tsx
// Accepts a YouTube/Vimeo/Drive link. No upload — link only.

import { useState } from 'react'
import { Link, X, CheckCircle2, AlertCircle } from 'lucide-react'

const ALLOWED_HOSTS = ['youtube.com', 'youtu.be', 'vimeo.com', 'drive.google.com']

function isValidVideoUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url)
    return ALLOWED_HOSTS.some(h => hostname === h || hostname.endsWith(`.${h}`))
  } catch { return false }
}

interface Props {
  value:       string | null
  onChange:    (v: string | null) => void
  label?:      string
  placeholder?: string
}

export default function VideoURLInput({
  value, onChange, label = 'Promo Video URL', placeholder = 'https://youtube.com/watch?v=...',
}: Props) {
  const [draft, setDraft] = useState(value ?? '')
  const [touched, setTouched] = useState(false)

  const isValid  = !draft || isValidVideoUrl(draft)
  const hasValue = !!draft.trim()

  function handleBlur() {
    setTouched(true)
    if (!draft.trim()) { onChange(null); return }
    if (isValidVideoUrl(draft)) { onChange(draft.trim()) }
  }

  function handleClear() {
    setDraft('')
    setTouched(false)
    onChange(null)
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="url"
          value={draft}
          onChange={e => { setDraft(e.target.value); setTouched(false) }}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full bg-white/5 border rounded-xl pl-9 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
            touched && !isValid && hasValue
              ? 'border-red-500/40 focus:border-red-500/60'
              : 'border-white/10 focus:border-white/25'
          }`}
        />
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10 text-gray-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {hasValue && touched && !isValid && (
        <p className="flex items-center gap-1 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5" />
          Only YouTube, Vimeo, or Google Drive links are allowed
        </p>
      )}
      {hasValue && isValid && touched && (
        <p className="flex items-center gap-1 text-xs text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Video link saved
        </p>
      )}
      {!hasValue && (
        <p className="text-xs text-gray-600">
          Supported: YouTube, Vimeo, Google Drive — link only, no upload
        </p>
      )}
    </div>
  )
}
