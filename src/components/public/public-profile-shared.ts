export interface PublicBusiness {
  id: string
  name: string
  category: string
  slug: string
  description: string | null
  logo_url: string | null
  website_url: string | null
  phone_number?: string | null
  street: string | null
  city_town: string | null
  local_government: string | null
  state: string | null
  country: string | null
  is_verified: boolean
  profile_views: number
  gallery_image_urls: string
  storefront_video_url: string | null
  created_at: string
  status: string
}

export interface DigitalProduct {
  id: string
  title: string
  slug: string
  description: string
  type: string
  price: number
  cover_image_url: string | null
  sales_count: number
  is_published: boolean
  file_size: number | null
}

export interface PhysicalProduct {
  id: string
  name: string
  description: string | null
  type: string
  price: number
  image_url: string | null
  is_active: boolean
}

export interface CartItem {
  id: string
  name: string
  price: number
  qty: number
  image: string | null
  type: 'digital' | 'physical'
  slug?: string
}

export function slugAccent(slug: string): string {
  const ACCENTS = [
    '#1C35EA',
    '#2A45F5',
    '#4B5EFF',
    '#1C35EA',
    '#1C35EA',
    '#3040F0',
    '#1C35EA',
    '#2540FF',
  ]

  const i =
    slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % ACCENTS.length

  return ACCENTS[i]
}

export function parseGallery(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function fmt(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString('en-NG', {
    minimumFractionDigits: 0,
  })}`
}

export function fmtSize(b: number | null): string | null {
  if (!b) return null
  if (b >= 1_000_000) return `${(b / 1_000_000).toFixed(1)} MB`
  if (b >= 1_000) return `${(b / 1_000).toFixed(0)} KB`
  return `${b} B`
}

export function fullAddress(b: PublicBusiness): string {
  return [
    b.street,
    b.city_town,
    b.local_government,
    b.state,
    b.country,
  ]
    .filter(Boolean)
    .join(', ')
}

export function mapsEmbed(b: PublicBusiness): string {
  const q = encodeURIComponent(fullAddress(b) || `${b.name} Nigeria`)
  return `https://maps.google.com/maps?q=${q}&output=embed&z=15`
}

export function mapsLink(b: PublicBusiness): string {
  return `https://maps.google.com/?q=${encodeURIComponent(
    fullAddress(b) || b.name
  )}`
}

export function waLink(phone: string, name: string): string {
  const n = phone.replace(/\D/g, '').replace(/^0/, '234')
  return `https://wa.me/${n}?text=${encodeURIComponent(
    `Hi ${name}, I found your business on OgaOS`
  )}`
}

export function yearSince(iso: string): number {
  return new Date(iso).getFullYear()
}