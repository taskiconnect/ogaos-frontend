import type {
  PublicBusinessPage,
  PurchaseDigitalProductRequest,
  PurchaseDigitalProductResponse,
  PublicOrderFulfillmentResponse,
  PublicBusinessSearchResponse,
  SearchPublicBusinessesParams,
} from '@/types/public'

// Note: Your proxy expects requests to /api/* which forwards to backend
// The backend path should NOT include /api/v1 prefix since proxy adds it
const API_BASE = '/api'

async function parseJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T
  } catch {
    return null
  }
}

export async function getPublicBusinessFull(slug: string): Promise<PublicBusinessPage> {
  const res = await fetch(`${API_BASE}/public/business/${slug}/full`, {
    method: 'GET',
    next: { revalidate: 60 },
  })

  const json = await parseJson<{ success?: boolean; message?: string; data?: PublicBusinessPage }>(res)

  if (!res.ok) {
    throw new Error(json?.message || 'Failed to fetch public business page')
  }

  // Handle both response formats: { data: ... } or direct response
  const data = json?.data ?? (json as unknown as PublicBusinessPage)

  if (!data || !('business' in data)) {
    throw new Error('Invalid public business page response')
  }

  return data
}

export async function searchPublicBusinesses(
  params: SearchPublicBusinessesParams
): Promise<PublicBusinessSearchResponse> {
  const searchParams = new URLSearchParams()

  // Only add non-empty search query
  if (params.q?.trim()) {
    searchParams.set('q', params.q.trim())
  }
  
  // Add location parameters if both are provided
  if (typeof params.lat === 'number' && !isNaN(params.lat)) {
    searchParams.set('lat', String(params.lat))
  }
  if (typeof params.lng === 'number' && !isNaN(params.lng)) {
    searchParams.set('lng', String(params.lng))
  }
  
  // Add radius if provided and location is available
  if (typeof params.radius_km === 'number' && params.radius_km > 0) {
    searchParams.set('radius_km', String(params.radius_km))
  }

  const url = `${API_BASE}/public/business/search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  
  const res = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
  })

  const json = await parseJson<{
    success?: boolean
    message?: string
    data?: PublicBusinessSearchResponse
  }>(res)

  if (!res.ok) {
    throw new Error(json?.message || 'Failed to search businesses')
  }

  // Handle both response formats
  const data = json?.data ?? (json as unknown as PublicBusinessSearchResponse)

  if (!data || !Array.isArray(data.results) || !data.meta) {
    throw new Error('Invalid public business search response')
  }

  return data
}

export async function purchaseDigitalProduct(
  businessId: string,
  payload: PurchaseDigitalProductRequest
): Promise<PurchaseDigitalProductResponse> {
  const res = await fetch(`${API_BASE}/public/store/${businessId}/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  const json = await parseJson<PurchaseDigitalProductResponse>(res)

  if (!res.ok) {
    throw new Error(json?.message || 'Failed to start purchase')
  }

  return json ?? { success: true, message: 'Purchase initiated' }
}

export async function getOrderFulfillment(
  orderId: string
): Promise<PublicOrderFulfillmentResponse> {
  const res = await fetch(`${API_BASE}/public/orders/${orderId}/fulfillment`, {
    method: 'GET',
    cache: 'no-store',
  })

  const json = await parseJson<PublicOrderFulfillmentResponse>(res)

  if (!res.ok) {
    throw new Error(json?.message || 'Failed to fetch fulfillment')
  }

  return json ?? { success: false, message: 'No fulfillment data returned' }
}

export function getOrderDownloadUrl(orderId: string): string {
  return `${API_BASE}/public/orders/${orderId}/download`
}

export function getTokenDownloadUrl(token: string): string {
  return `${API_BASE}/public/downloads/${token}`
}