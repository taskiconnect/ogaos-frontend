// ─── Core Types ───────────────────────────────────────────────────────────────

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

export interface PublicDigitalProduct {
  id: string
  title: string
  slug: string
  description: string
  type: string
  price: number
  currency: string
  fulfillment_mode: string  // Added - matches backend
  cover_image_url: string | null
  gallery_image_urls: string
  promo_video_url: string | null
  file_size: number | null
  file_mime_type: string | null
  delivery_note: string | null
  sales_count: number
  created_at: string
}

// Alias used by StickyNav / ProfileContent
export type DigitalProduct = PublicDigitalProduct

export interface PublicProduct {
  id: string
  name: string
  description: string | null
  type: string
  price: number
  image_url: string | null
  sku: string | null
  in_stock: boolean  // Required, not optional
  created_at: string
}

// Alias used by StickyNav / ProfileContent
export type ProductPublic = PublicProduct

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
  digital_products: PublicDigitalProduct[]
  physical_products: PublicProduct[]
  services: PublicProduct[]
  stats: PublicStats
  next_cursors?: PublicPageCursors | null
  cached_at?: string | null
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
  radius_km: number
  used_current_location: boolean
  location_denied: boolean
  total: number
}

export interface PublicBusinessSearchResponse {
  meta: PublicBusinessSearchMeta
  results: PublicBusinessSearchItem[]
}

export interface SearchPublicBusinessesParams {
  q?: string
  lat?: number
  lng?: number
  radius_km?: number
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
    checkout_url?: string
    access_token?: string
  }
}

export interface PublicOrderFulfillmentResponse {
  success: boolean
  message?: string
  data?: {
    order_id?: string
    access_granted?: boolean
    download_url?: string
    expires_at?: string
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

// ─── Utility Functions ────────────────────────────────────────────────────────

/**
 * Format a number as Nigerian Naira.
 * Assumes price is already in Naira (not kobo).
 */
export function formatCurrency(amount: number, currency = 'NGN'): string {
  if (currency === 'NGN') {
    return `₦${amount.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format bytes into human-readable size string.
 */
export function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`
  return `${bytes} B`
}

/**
 * Build a full address string from a business object.
 */
export function fullAddress(b: PublicBusiness): string {
  return [b.street, b.city_town, b.local_government, b.state, b.country]
    .filter(Boolean)
    .join(', ')
}

/**
 * Build a Google Maps embed URL for a business location.
 */
export function mapsEmbed(b: PublicBusiness): string {
  const q = encodeURIComponent(fullAddress(b) || `${b.name} Nigeria`)
  return `https://maps.google.com/maps?q=${q}&output=embed&z=15`
}

/**
 * Build a Google Maps link for a business location.
 */
export function mapsLink(b: PublicBusiness): string {
  return `https://maps.google.com/?q=${encodeURIComponent(fullAddress(b) || b.name)}`
}

/**
 * Build a WhatsApp deep-link for a business phone number.
 * Note: Phone number may not be available from public API
 */
export function waLink(phone: string, name: string): string {
  const n = phone.replace(/\D/g, '').replace(/^0/, '234')
  return `https://wa.me/${n}?text=${encodeURIComponent(
    `Hi ${name}, I found your business on OgaOS`
  )}`
}

/**
 * Parse a JSON-encoded gallery string into an array of URLs.
 */
export function parseGallery(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Deterministically pick an accent colour from a slug string.
 */
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
  const i = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % ACCENTS.length
  return ACCENTS[i]
}

/**
 * Extract the year from an ISO date string.
 */
export function yearSince(iso: string): number {
  return new Date(iso).getFullYear()
}