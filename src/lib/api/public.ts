import type {
  PublicBusinessPage,
  PurchaseDigitalProductRequest,
  PurchaseDigitalProductResponse,
  PublicOrderFulfillmentResponse,
  PublicBusinessSearchResponse,
  SearchPublicBusinessesParams,
} from '@/types/public'

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '')

async function parseJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T
  } catch {
    return null
  }
}

export async function getPublicBusinessFull(slug: string): Promise<PublicBusinessPage> {
  const res = await fetch(`${API_BASE}/public/business/${slug}/full`, {
    next: { revalidate: 60 },
  })

  const json = await parseJson<{ success?: boolean; message?: string; data?: PublicBusinessPage }>(res)

  if (!res.ok) {
    throw new Error(json?.message || 'Failed to fetch public business page')
  }

  const data = json?.data ?? (json as unknown as PublicBusinessPage)

  if (!data || !('business' in data)) {
    throw new Error('Invalid public business page response')
  }

  return data
}

export async function searchPublicBusinesses(
  params: SearchPublicBusinessesParams
): Promise<PublicBusinessSearchResponse> {
  const search = new URLSearchParams()

  if (params.q?.trim()) search.set('q', params.q.trim())
  search.set('state', params.state.trim())
  search.set('lga', params.lga.trim())
  search.set('radius_km', String(params.radius_km ?? 10))

  const res = await fetch(`${API_BASE}/public/business/search?${search.toString()}`, {
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

  return json ?? { success: true }
}

export async function getOrderFulfillment(
  orderId: string
): Promise<PublicOrderFulfillmentResponse> {
  const res = await fetch(`${API_BASE}/public/orders/${orderId}/fulfillment`, {
    cache: 'no-store',
  })

  const json = await parseJson<PublicOrderFulfillmentResponse>(res)

  if (!res.ok) {
    throw new Error(json?.message || 'Failed to fetch fulfillment')
  }

  return json ?? { success: true }
}

export function getOrderDownloadUrl(orderId: string): string {
  return `${API_BASE}/public/orders/${orderId}/download`
}

export function getTokenDownloadUrl(token: string): string {
  return `${API_BASE}/public/downloads/${token}`
}