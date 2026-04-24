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

export type DigitalProduct = PublicDigitalProduct

export interface PublicProduct {
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

export interface PublicDigitalStoreBusiness {
  name: string
  slug: string
  logo_url: string | null
}

export interface PublicDigitalStoreResponse {
  business: PublicDigitalStoreBusiness
  products: PublicDigitalProduct[]
}

export interface PublicDigitalProductResponse {
  id: string
  business_id: string
  title: string
  slug: string
  description: string
  type: string
  price: number
  currency: string
  fulfillment_mode: string
  access_redirect_url: string | null
  requires_account: boolean
  access_duration_hours: number | null
  delivery_note: string | null
  cover_image_url: string | null
  gallery_image_urls: string
  promo_video_url: string | null
  file_size: number | null
  file_mime_type: string | null
  is_published: boolean
  sales_count: number
  total_revenue: number
  created_at: string
  updated_at: string
  business: PublicDigitalStoreBusiness
}

export interface InitializeDigitalCheckoutRequest {
  buyer_name: string
  buyer_email: string
  buyer_phone?: string
  callback_url?: string
}

export interface InitializeDigitalCheckoutData {
  message: string
  order_id: string
  reference: string
  authorization_url: string
  access_code: string
  amount: number
  currency: string
  platform_fee: number
  owner_payout_amount: number
}

export interface InitializeDigitalCheckoutResponse {
  success?: boolean
  message?: string
  data?: InitializeDigitalCheckoutData
}

export interface PublicOrderFulfillmentData {
  order_id: string
  product_id: string
  product_title: string
  product_type: string
  fulfillment_mode: string
  fulfillment_status: string
  payment_status: string
  access_granted: boolean
  requires_account: boolean
  redirect_url?: string | null
  download_token?: string | null
  delivery_note?: string | null
  access_expires_at?: string | null
  message: string
}

export interface PublicOrderFulfillmentResponse {
  success?: boolean
  message?: string
  data?: PublicOrderFulfillmentData
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

export function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`
  return `${bytes} B`
}

export function fullAddress(b: PublicBusiness): string {
  return [b.street, b.city_town, b.local_government, b.state, b.country]
    .filter(Boolean)
    .join(', ')
}

export function mapsEmbed(b: PublicBusiness): string {
  const q = encodeURIComponent(fullAddress(b) || `${b.name} Nigeria`)
  return `https://maps.google.com/maps?q=${q}&output=embed&z=15`
}

export function mapsLink(b: PublicBusiness): string {
  return `https://maps.google.com/?q=${encodeURIComponent(fullAddress(b) || b.name)}`
}

export function waLink(phone: string, name: string): string {
  const n = phone.replace(/\D/g, '').replace(/^0/, '234')
  return `https://wa.me/${n}?text=${encodeURIComponent(
    `Hi ${name}, I found your business on OgaOS`
  )}`
}

export function parseGallery(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
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
  const i = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % ACCENTS.length
  return ACCENTS[i]
}

export function yearSince(iso: string): number {
  return new Date(iso).getFullYear()
}