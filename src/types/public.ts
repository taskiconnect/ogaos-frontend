// src/types/public.ts

export interface PublicBusiness {
  id: string
  name: string
  slug: string
  category: string
  description: string | null
  logo_url: string | null
  website_url: string | null
  street: string
  city_town: string
  local_government: string
  state: string
  country: string
  is_verified: boolean
  profile_views: number
  gallery_image_urls: string
  storefront_video_url: string | null
  keywords: string[]
}

export interface DigitalProduct {
  id: string
  title: string
  slug: string
  description: string
  type: string
  price: number
  currency: string
  fulfillment_mode: string
  cover_image_url: string | null
  gallery_image_urls: string
  promo_video_url: string | null
  file_size: number | null
  file_mime_type: string | null
  delivery_note: string | null
  sales_count: number
  created_at: string
}

export interface ProductPublic {
  id: string
  name: string
  description: string | null
  type: string
  price: number
  image_url: string | null
  sku: string | null
  in_stock: boolean
  created_at: string
}

export interface PublicStats {
  total_products: number
  total_services: number
  total_digital_products: number
}

export interface PublicPageCursors {
  digital_products?: string
  physical_products?: string
  services?: string
}

export interface PublicBusinessPage {
  business: PublicBusiness
  digital_products: DigitalProduct[]
  physical_products: ProductPublic[]
  services: ProductPublic[]
  stats: PublicStats
  next_cursors?: PublicPageCursors
  cached_at?: string
}

export interface PurchaseDigitalProductRequest {
  buyer_name: string
  buyer_email: string
  buyer_phone?: string
}

export interface PurchaseDigitalProductResponse {
  success: boolean
  message?: string
  data?: {
    order_id?: string
    fulfillment_url?: string
    download_url?: string
    access_url?: string
    status?: string
    payment_url?: string
    reference?: string
  }
}

export interface PublicOrderFulfillmentResponse {
  success: boolean
  message?: string
  data?: {
    order_id?: string
    status?: string
    fulfillment_mode?: string
    download_token?: string
    download_url?: string
    access_url?: string
    delivery_note?: string
  }
}

export interface CartItem {
  id: string
  name: string
  price: number
  qty: number
  image: string | null
  type: 'digital' | 'physical' | 'service'
  slug?: string
}

export interface PublicBusinessSearchItem {
  id: string
  name: string
  slug: string
  category: string
  description: string | null
  logo_url: string | null
  city_town: string
  local_government: string
  state: string
  country: string
  is_verified: boolean
  keywords: string[]
  distance_km: number
}

export interface PublicBusinessSearchMeta {
  query: string
  state: string
  local_government: string
  radius_km: number
  used_fallback_radius: boolean
  suggested_expanded_radius_km?: number
  total: number
}

export interface PublicBusinessSearchResponse {
  meta: PublicBusinessSearchMeta
  results: PublicBusinessSearchItem[]
}

export interface SearchPublicBusinessesParams {
  q?: string
  state: string
  lga: string
  radius_km?: number
}

export interface PublicStateOption {
  name: string
  lgas: string[]
}

export function parseGallery(raw: string | null | undefined): string[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === 'string')
      : []
  } catch {
    return []
  }
}

export function formatCurrency(amount: number, currency = 'NGN'): string {
  const normalized = currency || 'NGN'
  const value = amount / 100

  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: normalized,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `₦${value.toLocaleString('en-NG')}`
  }
}

export function formatBytes(bytes: number | null | undefined): string | null {
  if (!bytes || bytes <= 0) return null
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}

export function fullAddress(business: PublicBusiness): string {
  return [
    business.street,
    business.city_town,
    business.local_government,
    business.state,
    business.country,
  ]
    .filter(Boolean)
    .join(', ')
}

export function mapsEmbed(business: PublicBusiness): string {
  const q = encodeURIComponent(fullAddress(business) || `${business.name} ${business.country || ''}`)
  return `https://maps.google.com/maps?q=${q}&output=embed&z=15`
}

export function mapsLink(business: PublicBusiness): string {
  return `https://maps.google.com/?q=${encodeURIComponent(
    fullAddress(business) || business.name
  )}`
}

export function waLink(phone: string, name: string): string {
  const normalized = phone.replace(/\D/g, '').replace(/^0/, '234')
  return `https://wa.me/${normalized}?text=${encodeURIComponent(
    `Hi ${name}, I found your business on OgaOS`
  )}`
}

export function slugAccent(slug: string): string {
  const accents = ['#1C35EA', '#2A45F5', '#4B5EFF', '#3040F0', '#2540FF']
  const index =
    slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % accents.length
  return accents[index]
}