'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getBusiness,
  updateBusiness,
  uploadBusinessLogo,
  setBusinessVisibility,
  listStaff,
  addBusinessGalleryImage,
  removeBusinessGalleryImage,
  setStorefrontVideo,
} from '@/lib/api/business'
import { getStates, getLGAs } from '@/lib/api/location'
import {
  getMyBusinessKeywords,
  setMyBusinessKeywords,
} from '@/lib/api/keyword'
import { createStaff, deactivateStaff } from '@/lib/api/auth'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import {
  Camera,
  Loader2,
  UserPlus,
  UserX,
  Eye,
  EyeOff,
  Check,
  X,
  Copy,
  ExternalLink,
  ImagePlus,
  Trash2,
  Tags,
  Plus,
  Globe,
  ChevronDown,
  MapPinned,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Business } from '@/lib/api/types'

// ─── Custom dropdown — replaces native <select> so options are always visible ─
function LocationSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          'w-full flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none text-left transition-colors',
          disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-white/25 cursor-pointer',
          value ? 'text-white' : 'text-gray-400'
        )}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown
          className={cn('w-4 h-4 text-gray-500 shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1.5 w-full rounded-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden" style={{ backgroundColor: '#0d1526' }}>
          <div className="max-h-56 overflow-y-auto overscroll-contain">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-white/[0.06] hover:text-gray-300 transition-colors border-b border-white/[0.06]"
            >
              {placeholder}
            </button>
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false) }}
                className={cn(
                  'w-full text-left px-4 py-2.5 text-sm transition-colors border-b border-white/[0.04] last:border-b-0',
                  value === opt
                    ? 'bg-primary/20 text-white font-medium'
                    : 'text-gray-300 hover:bg-white/[0.06] hover:text-white'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BusinessAvatar({ business }: { business: Business }) {
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

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function StaffRow({
  member,
  onDeactivate,
}: {
  member: any
  onDeactivate: (id: string) => void
}) {
  const [confirm, setConfirm] = useState(false)

  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-primary">
          {member.first_name?.[0]?.toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">
          {member.first_name} {member.last_name}
        </p>
        <p className="text-xs text-gray-500 truncate">{member.email}</p>
      </div>

      <span
        className={cn(
          'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
          member.is_active
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        )}
      >
        {member.is_active ? 'Active' : 'Inactive'}
      </span>

      {member.is_active && !confirm && (
        <button
          onClick={() => setConfirm(true)}
          className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors"
        >
          <UserX className="w-3.5 h-3.5" />
        </button>
      )}

      {confirm && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDeactivate(member.id)}
            className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 flex items-center justify-center"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-gray-400 flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

function AddStaffInline({ onSuccess }: { onSuccess: () => void }) {
  const [show, setShow] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const mut = useMutation({
    mutationFn: () =>
      createStaff({
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phone,
        password,
      }),
    onSuccess: () => {
      onSuccess()
      setShow(false)
      setFirstName('')
      setLastName('')
      setEmail('')
      setPhone('')
      setPassword('')
      setError('')
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed to invite staff'),
  })

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-semibold"
      >
        <UserPlus className="w-4 h-4" />
        Invite Staff Member
      </button>
    )
  }

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-white">Invite New Staff</p>

      <div className="grid grid-cols-2 gap-3">
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First name"
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
        />
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last name"
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
        />
      </div>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        type="email"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
      />

      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone number"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
      />

      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Temporary password"
        type="password"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
      />

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={() => setShow(false)}
          className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => mut.mutate()}
          disabled={mut.isPending || !firstName || !email || !password}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
        >
          {mut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Send Invite
        </button>
      </div>
    </div>
  )
}

function StorefrontLink({ slug, isPublic }: { slug: string; isPublic: boolean }) {
  const [copied, setCopied] = useState(false)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const url = `${baseUrl}/public/${slug}`

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs text-gray-500">Your storefront link:</p>

      <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3">
        <span className="flex-1 text-xs font-mono text-primary truncate">{url}</span>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors shrink-0 font-semibold"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary hover:bg-primary/20 transition-colors shrink-0 font-semibold"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open
        </a>
      </div>

      <div className="flex items-center gap-2 text-xs">
        {isPublic ? (
          <>
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400">Live — customers can visit this link</span>
          </>
        ) : (
          <>
            <EyeOff className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-gray-500">Hidden — enable the toggle above to go live</span>
          </>
        )}
      </div>
    </div>
  )
}

function StorefrontGallery({ business }: { business: Business }) {
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

    if (gallery.length >= 3) {
      setGalleryErr('Maximum 3 images allowed')
      return
    }
    if (!file.type.startsWith('image/')) {
      setGalleryErr('Only image files are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setGalleryErr('Image must be under 5 MB')
      return
    }

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
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-white">Store Gallery</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Up to 3 photos of your store, team, or workspace
            </p>
          </div>

          {gallery.length < 3 && (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImagePlus className="w-3.5 h-3.5" />
              )}
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
            <div
              key={url}
              className="relative group aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10"
            >
              <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removeMut.mutate(i)}
                disabled={removeMut.isPending}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                {removeMut.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
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

      <div>
        <p className="text-sm font-medium text-white mb-1">Storefront Video</p>
        <p className="text-xs text-gray-400 mb-3">
          Paste a YouTube, Vimeo or Google Drive link — no upload needed
        </p>

        <div className="flex items-center gap-2">
          <input
            value={videoUrl}
            onChange={(e) => {
              setVideoUrl(e.target.value)
              setVideoSaved(false)
              setVideoErr('')
            }}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25"
          />

          <button
            onClick={() => {
              if (!isValidVideoUrl(videoUrl)) {
                setVideoErr('Only YouTube, Vimeo, or Google Drive links')
                return
              }
              videoMut.mutate(videoUrl.trim())
            }}
            disabled={videoMut.isPending}
            className="px-4 py-3 rounded-xl text-sm font-semibold text-white shrink-0 disabled:opacity-50 flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
          >
            {videoMut.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : videoSaved ? (
              <Check className="w-4 h-4" />
            ) : (
              'Save'
            )}
          </button>
        </div>

        {videoErr && <p className="text-xs text-red-400 mt-2">{videoErr}</p>}
        {!videoUrl && (
          <p className="text-xs text-gray-600 mt-1.5">
            Supported: YouTube · Vimeo · Google Drive
          </p>
        )}
      </div>
    </div>
  )
}

function BusinessKeywordsSection() {
  const qc = useQueryClient()

  const [keywordInput, setKeywordInput] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const hasHydrated = useRef(false)
  const [isDirty, setIsDirty] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [suggestions, setSuggestions] = useState<string[]>([])
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
  const [isSuggesting, setIsSuggesting] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const { data: fetchedKeywords = [], isLoading, isSuccess } = useQuery({
    queryKey: ['business-keywords'],
    queryFn: getMyBusinessKeywords,
  })

  useEffect(() => {
    if (isSuccess && Array.isArray(fetchedKeywords) && (!hasHydrated.current || !isDirty)) {
      setKeywords(fetchedKeywords)
      hasHydrated.current = true
    }
  }, [fetchedKeywords, isSuccess, isDirty])

  function toTitleCase(value: string) {
    return value
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  function keywordExists(value: string) {
    return keywords.some((keyword) => keyword.toLowerCase() === value.toLowerCase())
  }

  async function loadSuggestions(query: string) {
    const trimmed = query.trim()
    if (!trimmed) {
      setSuggestions([])
      setSuggestionsOpen(false)
      setActiveSuggestionIndex(-1)
      return
    }

    setIsSuggesting(true)
    try {
      // Fetch directly so we can handle any response shape from the backend
      const res = await fetch(
        `/api/public/keywords/suggestions?q=${encodeURIComponent(trimmed)}`,
        { cache: 'no-store' }
      )
      const json = await res.json().catch(() => null)

      // Handle all possible shapes:
      // { data: { keywords: [] } }, { data: [] }, { keywords: [] }, []
      const raw: unknown =
        json?.data?.keywords ??
        json?.data?.results ??
        json?.data ??
        json?.keywords ??
        json?.results ??
        json

      const list: string[] = Array.isArray(raw)
        ? raw.filter((x): x is string => typeof x === 'string')
        : []

      const filtered = list.filter((item) => !keywordExists(item))

      setSuggestions(filtered)
      setSuggestionsOpen(filtered.length > 0)
      setActiveSuggestionIndex(filtered.length > 0 ? 0 : -1)
    } catch (err) {
      console.error('[suggestions] failed:', err)
      setSuggestions([])
      setSuggestionsOpen(false)
      setActiveSuggestionIndex(-1)
    } finally {
      setIsSuggesting(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSuggestions(keywordInput)
    }, 250)

    return () => clearTimeout(timer)
  }, [keywordInput])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      const withinInput = inputRef.current?.contains(target)
      const withinSuggestions = suggestionsRef.current?.contains(target)

      if (!withinInput && !withinSuggestions) {
        setSuggestionsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function resetSuggestions() {
    setSuggestions([])
    setSuggestionsOpen(false)
    setActiveSuggestionIndex(-1)
  }

  function addKeyword(raw?: string) {
    const value = toTitleCase(raw ?? keywordInput)

    if (!value) return

    if (value.length > 80) {
      setError('Each keyword must be 80 characters or less.')
      return
    }

    if (keywordExists(value)) {
      setError('That keyword has already been added.')
      return
    }

    if (keywords.length >= 15) {
      setError('You can add up to 15 keywords.')
      return
    }

    setKeywords((prev) => [...prev, value])
    setKeywordInput('')
    setError('')
    setIsDirty(true)
    resetSuggestions()
  }

  function removeKeyword(value: string) {
    setKeywords((prev) => prev.filter((keyword) => keyword !== value))
    setError('')
    setIsDirty(true)
  }

  const saveMut = useMutation({
    mutationFn: () => setMyBusinessKeywords({ keywords }),
    onSuccess: (data) => {
      const next = Array.isArray(data) ? data : []
      setKeywords(next)
      setSaved(true)
      setError('')
      setIsDirty(false)
      qc.invalidateQueries({ queryKey: ['business-keywords'] })
      setTimeout(() => setSaved(false), 3000)
    },
    onError: (e: any) => {
      setError(e?.response?.data?.message ?? 'Failed to save keywords')
    },
  })

  const remaining = Math.max(0, 15 - keywords.length)

  if (isLoading && !hasHydrated.current) {
    return (
      <Section title="Business Keywords">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading keywords...
        </div>
      </Section>
    )
  }

  return (
    <Section title="Business Keywords">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Tags className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              Help customers discover your business
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Add keywords that describe your business, products, or services. Maximum 15 keywords.
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={keywordInput}
                onChange={(e) => {
                  setKeywordInput(e.target.value)
                  setError('')
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setSuggestionsOpen(true)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    if (!suggestions.length) return
                    setSuggestionsOpen(true)
                    setActiveSuggestionIndex((prev) =>
                      prev < suggestions.length - 1 ? prev + 1 : 0
                    )
                    return
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    if (!suggestions.length) return
                    setSuggestionsOpen(true)
                    setActiveSuggestionIndex((prev) =>
                      prev > 0 ? prev - 1 : suggestions.length - 1
                    )
                    return
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (suggestionsOpen && activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
                      addKeyword(suggestions[activeSuggestionIndex])
                      return
                    }
                    addKeyword()
                    return
                  }
                  if (e.key === ',') {
                    e.preventDefault()
                    addKeyword()
                    return
                  }
                  if (e.key === 'Escape') {
                    setSuggestionsOpen(false)
                  }
                }}
                placeholder="e.g. Fashion, Tailoring, Cakes…"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/[0.06] transition-all"
              />

              {isSuggesting && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                </div>
              )}

              {suggestionsOpen && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-30 top-full mt-1.5 w-full rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden"
                  style={{ backgroundColor: '#0d1526' }}
                >
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                      Suggestions
                    </span>
                    <span className="text-[10px] text-gray-600">
                      ↑↓ to navigate · Enter to add
                    </span>
                  </div>

                  <div className="max-h-52 overflow-y-auto overscroll-contain">
                    {suggestions.map((suggestion, index) => {
                      const active = index === activeSuggestionIndex
                      return (
                        <button
                          key={`${suggestion}-${index}`}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => addKeyword(suggestion)}
                          onMouseEnter={() => setActiveSuggestionIndex(index)}
                          className={cn(
                            'w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors border-b border-white/[0.04] last:border-b-0',
                            active
                              ? 'bg-primary/20 text-white'
                              : 'text-gray-300 hover:bg-white/[0.05] hover:text-white'
                          )}
                        >
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full shrink-0 transition-colors',
                              active ? 'bg-primary' : 'bg-white/10'
                            )}
                          />
                          {suggestion}
                          {active && (
                            <Plus className="w-3.5 h-3.5 ml-auto text-primary opacity-70" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => addKeyword()}
              disabled={!keywordInput.trim() || keywords.length >= 15}
              className="px-5 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2 shrink-0 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">
              <span className="text-white font-medium">{keywords.length}</span> / 15 keywords
            </span>
            <span className={cn('font-medium', remaining <= 3 ? 'text-yellow-400' : 'text-gray-500')}>
              {remaining} remaining
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(keywords.length / 15) * 100}%`,
                background: 'linear-gradient(90deg, #002b9d, #3f9af5)',
              }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 min-h-[100px]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Added Keywords
            </p>
            {keywords.length > 0 && (
              <span className="text-[11px] text-gray-600">click tag to remove</span>
            )}
          </div>

          {keywords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-5 gap-1.5">
              <Tags className="w-6 h-6 text-gray-700" />
              <p className="text-sm text-gray-500">No keywords added yet</p>
              <p className="text-xs text-gray-600">Type above and press Enter or comma</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <button
                  key={`${keyword}-${index}`}
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  className="group inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm text-white hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 transition-all"
                  aria-label={`Remove ${keyword}`}
                >
                  <span className="font-medium">{keyword}</span>
                  <X className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-600">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 font-mono text-[10px]">Enter</kbd>{' '}
          or <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 font-mono text-[10px]">,</kbd>{' '}
          to add · <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 font-mono text-[10px]">↑↓</kbd>{' '}
          to navigate suggestions · click a tag to remove it
        </p>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => saveMut.mutate()}
            disabled={saveMut.isPending}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
          >
            {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Keywords
          </button>

          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-400 font-medium">
              <Check className="w-4 h-4" />
              Saved!
            </span>
          )}
        </div>
      </div>
    </Section>
  )
}

export default function SettingsPage() {
  const qc = useQueryClient()

  const { data: business, isLoading } = useQuery({
    queryKey: ['business'],
    queryFn: getBusiness,
  })

  const { data: staffList } = useQuery({
    queryKey: ['staff'],
    queryFn: listStaff,
  })

  const { data: states = [], isLoading: statesLoading } = useQuery({
    queryKey: ['location-states'],
    queryFn: getStates,
    staleTime: 1000 * 60 * 60,
  })

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [street, setStreet] = useState('')
  const [cityTown, setCityTown] = useState('')
  const [localGovt, setLocalGovt] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('Nigeria')
  const [initialised, setInitialised] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState('')

  const previousStateRef = useRef<string>('')

  const { data: lgas = [], isLoading: lgasLoading } = useQuery({
    queryKey: ['location-lgas', state],
    queryFn: () => getLGAs(state),
    enabled: !!state.trim(),
    staleTime: 1000 * 60 * 60,
  })

  useEffect(() => {
    if (business && !initialised) {
      setName(business.name ?? '')
      setCategory(business.category ?? '')
      setDescription(business.description ?? '')
      setWebsiteUrl(business.website_url ?? '')
      setStreet(business.street ?? '')
      setCityTown(business.city_town ?? '')
      setLocalGovt(business.local_government ?? '')
      setState(business.state ?? '')
      setCountry(business.country ?? 'Nigeria')
      previousStateRef.current = business.state ?? ''
      setInitialised(true)
    }
  }, [business, initialised])

  useEffect(() => {
    if (!initialised) return

    if (previousStateRef.current && previousStateRef.current !== state) {
      setLocalGovt('')
    }

    previousStateRef.current = state
  }, [state, initialised])

  useEffect(() => {
    if (!state || !localGovt || lgas.length === 0) return

    const exists = lgas.some((item) => item.toLowerCase() === localGovt.toLowerCase())
    if (!exists) {
      setLocalGovt('')
    }
  }, [lgas, localGovt, state])

  const stateOptions = useMemo(() => states, [states])
  const lgaOptions = useMemo(() => lgas, [lgas])

  const updateMut = useMutation({
    mutationFn: () =>
      updateBusiness({
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        website_url: websiteUrl.trim(),
        street: street.trim(),
        city_town: cityTown.trim(),
        local_government: localGovt.trim(),
        state: state.trim(),
        country: country.trim(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['business'] })
      setProfileSaved(true)
      setProfileError('')
      setTimeout(() => setProfileSaved(false), 3000)
    },
    onError: (e: any) => setProfileError(e?.response?.data?.message ?? 'Update failed'),
  })

  const visibilityMut = useMutation({
    mutationFn: (isPublic: boolean) => setBusinessVisibility(isPublic),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
  })

  const deactivateMut = useMutation({
    mutationFn: (staffId: string) => deactivateStaff(staffId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  })

  const staff = Array.isArray(staffList) ? staffList : []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <Sidebar />
      <div className="lg:pl-72">
        <DashboardHeader />

        <main className="p-6 lg:p-10 space-y-8 pb-20 max-w-3xl">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-gray-400 mt-1 text-sm">Manage your business profile and team</p>
          </div>

          <Section title="Business Profile">
            <div className="space-y-5">
              <div className="flex items-center gap-5">
                {business && <BusinessAvatar business={business} />}
                <div>
                  <p className="text-sm font-medium text-white">{business?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{business?.category}</p>
                  <p className="text-xs text-gray-500 mt-1">Click the logo to upload a new one</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Business Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/25"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/25"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Tell customers what your business does..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Website URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourbusiness.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <MapPinned className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Business Location</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Pick your state and local government from the official list used by search.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Street
                    </label>
                    <input
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      City / Town
                    </label>
                    <input
                      value={cityTown}
                      onChange={(e) => setCityTown(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Country
                    </label>
                    <input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      State
                    </label>
                    <LocationSelect
                      value={state}
                      onChange={setState}
                      options={stateOptions}
                      placeholder={statesLoading ? 'Loading states...' : 'Select state'}
                      disabled={statesLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Local Government
                    </label>
                    <LocationSelect
                      value={localGovt}
                      onChange={setLocalGovt}
                      options={lgaOptions}
                      placeholder={!state ? 'Select state first' : lgasLoading ? 'Loading LGAs...' : 'Select LGA'}
                      disabled={!state || lgasLoading}
                    />
                  </div>
                </div>
              </div>

              {profileError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {profileError}
                </p>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateMut.mutate()}
                  disabled={updateMut.isPending}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
                >
                  {updateMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save Profile
                </button>

                {profileSaved && (
                  <span className="flex items-center gap-1.5 text-sm text-emerald-400 font-medium">
                    <Check className="w-4 h-4" />
                    Saved!
                  </span>
                )}
              </div>
            </div>
          </Section>

          <BusinessKeywordsSection />

          <Section title="Public Storefront">
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-sm font-medium text-white">Public storefront</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Allow customers to find and view your business online
                </p>
              </div>

              <button
                onClick={() => business && visibilityMut.mutate(!business.is_profile_public)}
                disabled={visibilityMut.isPending}
                className={cn(
                  'w-12 h-7 rounded-full border transition-all relative shrink-0 disabled:opacity-50',
                  business?.is_profile_public
                    ? 'bg-primary border-primary'
                    : 'bg-white/5 border-white/20'
                )}
              >
                <div
                  className={cn(
                    'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all',
                    business?.is_profile_public ? 'left-5' : 'left-0.5'
                  )}
                />
              </button>
            </div>

            {business?.slug && (
              <StorefrontLink slug={business.slug} isPublic={business.is_profile_public} />
            )}

            {business && (
              <>
                <div className="border-t border-white/5 my-2" />
                <StorefrontGallery business={business} />
              </>
            )}
          </Section>

          <Section title="Staff Management">
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                You can have up to 2 staff members on the Starter plan.{' '}
                <span className="text-white font-medium">
                  {staff.filter((s: any) => s.is_active).length}
                </span>{' '}
                active now.
              </p>

              {staff.length > 0 && (
                <div className="divide-y divide-white/5">
                  {staff.map((member: any) => (
                    <StaffRow
                      key={member.id}
                      member={member}
                      onDeactivate={(id) => deactivateMut.mutate(id)}
                    />
                  ))}
                </div>
              )}

              {staff.filter((s: any) => s.is_active).length < 2 && (
                <AddStaffInline onSuccess={() => qc.invalidateQueries({ queryKey: ['staff'] })} />
              )}

              {staff.filter((s: any) => s.is_active).length >= 2 && (
                <p className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3">
                  Staff limit reached. Deactivate a member to invite someone new.
                </p>
              )}
            </div>
          </Section>

          <Section title="Account Info">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Business ID</span>
                <span className="font-mono text-xs text-gray-300">
                  {business?.id?.slice(0, 16)}...
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Slug</span>
                <span className="font-mono text-xs text-primary">/{business?.slug}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span
                  className={cn(
                    'text-xs font-semibold',
                    business?.status === 'active' ? 'text-emerald-400' : 'text-yellow-400'
                  )}
                >
                  {business?.status}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Verified</span>
                <span className={business?.is_verified ? 'text-emerald-400' : 'text-gray-500'}>
                  {business?.is_verified ? 'Yes' : 'Not yet verified'}
                </span>
              </div>
            </div>
          </Section>
        </main>
      </div>
    </div>
  )
}