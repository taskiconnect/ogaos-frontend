'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getBusiness, updateBusiness, uploadBusinessLogo, setBusinessVisibility,
  listStaff, addBusinessGalleryImage, removeBusinessGalleryImage, setStorefrontVideo,
} from '@/lib/api/business'
import { createStaff, deactivateStaff } from '@/lib/api/auth'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import {
  Building2, Globe, MapPin, Camera, Loader2,
  Users, UserPlus, UserX, Eye, EyeOff, Check, X,
  Copy, ExternalLink, ImagePlus, Video, Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Business } from '@/lib/api/types'

// ─── Avatar / Logo ────────────────────────────────────────────────────────────

function BusinessAvatar({ business, onUpload }: { business: Business; onUpload: () => void }) {
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
    <div className="relative w-20 h-20 group cursor-pointer" onClick={() => fileRef.current?.click()}>
      {business.logo_url ? (
        <img src={business.logo_url} alt="Logo" className="w-20 h-20 rounded-2xl object-cover border border-white/10" />
      ) : (
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="text-3xl font-bold text-primary">{business.name[0]?.toUpperCase()}</span>
        </div>
      )}
      <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        {uploadMut.isPending
          ? <Loader2 className="w-5 h-5 text-white animate-spin" />
          : <Camera className="w-5 h-5 text-white" />
        }
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

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

// ─── Staff row ────────────────────────────────────────────────────────────────

function StaffRow({ member, onDeactivate }: { member: any; onDeactivate: (id: string) => void }) {
  const [confirm, setConfirm] = useState(false)
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-primary">{member.first_name[0]?.toUpperCase()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{member.first_name} {member.last_name}</p>
        <p className="text-xs text-gray-500 truncate">{member.email}</p>
      </div>
      <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border',
        member.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20')}>
        {member.is_active ? 'Active' : 'Inactive'}
      </span>
      {member.is_active && !confirm && (
        <button onClick={() => setConfirm(true)}
          className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors">
          <UserX className="w-3.5 h-3.5" />
        </button>
      )}
      {confirm && (
        <div className="flex items-center gap-1">
          <button onClick={() => onDeactivate(member.id)}
            className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 flex items-center justify-center">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setConfirm(false)}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-gray-400 flex items-center justify-center">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Add Staff Modal ──────────────────────────────────────────────────────────

function AddStaffInline({ onSuccess }: { onSuccess: () => void }) {
  const [show, setShow]           = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [email, setEmail]         = useState('')
  const [phone, setPhone]         = useState('')
  const [password, setPassword]   = useState('')
  const [error, setError]         = useState('')

  const mut = useMutation({
    mutationFn: () => createStaff({ first_name: firstName, last_name: lastName, email, phone_number: phone, password }),
    onSuccess: () => { onSuccess(); setShow(false); setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setPassword(''); setError('') },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Failed to invite staff'),
  })

  if (!show) return (
    <button onClick={() => setShow(true)}
      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-semibold">
      <UserPlus className="w-4 h-4" /> Invite Staff Member
    </button>
  )

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-white">Invite New Staff</p>
      <div className="grid grid-cols-2 gap-3">
        <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name"
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none" />
        <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name"
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none" />
      </div>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none" />
      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none" />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Temporary password" type="password"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none" />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button onClick={() => setShow(false)}
          className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:bg-white/10 transition-colors">
          Cancel
        </button>
        <button onClick={() => mut.mutate()} disabled={mut.isPending || !firstName || !email || !password}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
          {mut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Send Invite
        </button>
      </div>
    </div>
  )
}

// ─── Storefront Link Component ────────────────────────────────────────────────

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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors shrink-0 font-semibold">
          {copied
            ? <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
            : <><Copy className="w-3.5 h-3.5" />Copy</>
          }
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary hover:bg-primary/20 transition-colors shrink-0 font-semibold">
          <ExternalLink className="w-3.5 h-3.5" /> Open
        </a>
      </div>
      <div className="flex items-center gap-2 text-xs">
        {isPublic
          ? <><Eye className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Live — customers can visit this link</span></>
          : <><EyeOff className="w-3.5 h-3.5 text-gray-500" /><span className="text-gray-500">Hidden — enable the toggle above to go live</span></>
        }
      </div>
    </div>
  )
}

// ─── Storefront Gallery ────────────────────────────────────────────────────────

function StorefrontGallery({ business }: { business: Business }) {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading,   setUploading]   = useState(false)
  const [videoUrl,    setVideoUrl]    = useState((business as any).storefront_video_url ?? '')
  const [videoSaved,  setVideoSaved]  = useState(false)
  const [galleryErr,  setGalleryErr]  = useState('')
  const [videoErr,    setVideoErr]    = useState('')

  const gallery: string[] = (() => {
    try { return JSON.parse((business as any).gallery_image_urls ?? '[]') } catch { return [] }
  })()

  const removeMut = useMutation({
    mutationFn: (index: number) => removeBusinessGalleryImage(index),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['business'] }),
    onError: () => setGalleryErr('Failed to remove image'),
  })
  const videoMut = useMutation({
    mutationFn: (url: string) => setStorefrontVideo(url),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['business'] }); setVideoSaved(true); setTimeout(() => setVideoSaved(false), 2000) },
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
      return ['youtube.com','youtu.be','vimeo.com','drive.google.com'].some(d => h === d || h.endsWith(`.${d}`))
    } catch { return false }
  }

  return (
    <div className="space-y-6">
      {/* Gallery images */}
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
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = '' }} />
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
            <button key={`slot-${i}`} onClick={() => fileRef.current?.click()} disabled={uploading}
              className="aspect-video rounded-xl border-2 border-dashed border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-primary disabled:opacity-50">
              <ImagePlus className="w-5 h-5" />
              <span className="text-[10px]">Add photo</span>
            </button>
          ))}
        </div>
        {galleryErr && <p className="text-xs text-red-400 mt-2">{galleryErr}</p>}
      </div>

      {/* Storefront promo video */}
      <div>
        <p className="text-sm font-medium text-white mb-1">Storefront Video</p>
        <p className="text-xs text-gray-400 mb-3">Paste a YouTube, Vimeo or Google Drive link — no upload needed</p>
        <div className="flex items-center gap-2">
          <input
            value={videoUrl}
            onChange={e => { setVideoUrl(e.target.value); setVideoSaved(false); setVideoErr('') }}
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
        {!videoUrl && (
          <p className="text-xs text-gray-600 mt-1.5">Supported: YouTube · Vimeo · Google Drive</p>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const qc = useQueryClient()

  const { data: business, isLoading } = useQuery({ queryKey: ['business'], queryFn: getBusiness })
  const { data: staffList } = useQuery({ queryKey: ['staff'], queryFn: listStaff })

  // Profile form state (initialised from business when loaded)
  const [name, setName]                   = useState('')
  const [category, setCategory]           = useState('')
  const [description, setDescription]     = useState('')
  const [websiteUrl, setWebsiteUrl]       = useState('')
  const [street, setStreet]               = useState('')
  const [cityTown, setCityTown]           = useState('')
  const [localGovt, setLocalGovt]         = useState('')
  const [state, setState]                 = useState('')
  const [country, setCountry]             = useState('')
  const [initialised, setInitialised]     = useState(false)
  const [profileSaved, setProfileSaved]   = useState(false)
  const [profileError, setProfileError]   = useState('')

  // Populate form once business loads
  if (business && !initialised) {
    setName(business.name ?? ''); setCategory(business.category ?? '')
    setDescription(business.description ?? ''); setWebsiteUrl(business.website_url ?? '')
    setStreet(business.street ?? ''); setCityTown(business.city_town ?? '')
    setLocalGovt(business.local_government ?? ''); setState(business.state ?? '')
    setCountry(business.country ?? 'Nigeria'); setInitialised(true)
  }

  const updateMut = useMutation({
    mutationFn: () => updateBusiness({ name, category, description, website_url: websiteUrl, street, city_town: cityTown, local_government: localGovt, state, country }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['business'] }); setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000) },
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

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
    </div>
  )

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

          {/* Business Profile */}
          <Section title="Business Profile">
            <div className="space-y-5">
              {/* Logo */}
              <div className="flex items-center gap-5">
                {business && <BusinessAvatar business={business} onUpload={() => {}} />}
                <div>
                  <p className="text-sm font-medium text-white">{business?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{business?.category}</p>
                  <p className="text-xs text-gray-500 mt-1">Click the logo to upload a new one</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Business Name</label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/25" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                  <input value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/25" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                  placeholder="Tell customers what your business does..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none resize-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourbusiness.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Street</label>
                  <input value={street} onChange={e => setStreet(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">City / Town</label>
                  <input value={cityTown} onChange={e => setCityTown(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">LGA</label>
                  <input value={localGovt} onChange={e => setLocalGovt(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">State</label>
                  <input value={state} onChange={e => setState(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
                </div>
              </div>

              {profileError && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{profileError}</p>}

              <div className="flex items-center gap-3">
                <button onClick={() => updateMut.mutate()} disabled={updateMut.isPending}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}>
                  {updateMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Profile
                </button>
                {profileSaved && (
                  <span className="flex items-center gap-1.5 text-sm text-emerald-400 font-medium">
                    <Check className="w-4 h-4" /> Saved!
                  </span>
                )}
              </div>
            </div>
          </Section>

          {/* Visibility + Storefront Link */}
          <Section title="Public Storefront">
            {/* Toggle */}
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
                className={cn('w-12 h-7 rounded-full border transition-all relative shrink-0 disabled:opacity-50',
                  business?.is_profile_public ? 'bg-primary border-primary' : 'bg-white/5 border-white/20')}>
                <div className={cn('absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all',
                  business?.is_profile_public ? 'left-5' : 'left-0.5')} />
              </button>
            </div>

            {/* Storefront link box */}
            {business?.slug && (
              <StorefrontLink slug={business.slug} isPublic={business.is_profile_public} />
            )}

            {/* Gallery + video */}
            {business && (
              <>
                <div className="border-t border-white/5 my-2" />
                <StorefrontGallery business={business} />
              </>
            )}
          </Section>

          {/* Staff Management */}
          <Section title="Staff Management">
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                You can have up to 2 staff members on the Starter plan.{' '}
                <span className="text-white font-medium">{staff.filter((s: any) => s.is_active).length}</span> active now.
              </p>

              {staff.length > 0 && (
                <div className="divide-y divide-white/5">
                  {staff.map((member: any) => (
                    <StaffRow key={member.id} member={member} onDeactivate={(id) => deactivateMut.mutate(id)} />
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

          {/* Business info (read-only) */}
          <Section title="Account Info">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Business ID</span>
                <span className="font-mono text-xs text-gray-300">{business?.id?.slice(0, 16)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Slug</span>
                <span className="font-mono text-xs text-primary">/{business?.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className={cn('text-xs font-semibold', business?.status === 'active' ? 'text-emerald-400' : 'text-yellow-400')}>
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
