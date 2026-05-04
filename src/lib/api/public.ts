// src/lib/api/public.ts

import type {
  PublicBusinessPage,
  PublicOrderFulfillmentResponse,
  PublicBusinessSearchResponse,
  SearchPublicBusinessesParams,
  PublicDigitalStoreResponse,
  PublicDigitalProductResponse,
  InitializeDigitalCheckoutRequest,
  InitializeDigitalCheckoutResponse,
} from '@/types/public'

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'

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
    headers: {
      Connection: 'close',
    },
  })

  const json = await parseJson<{
    success?: boolean
    message?: string
    data?: PublicBusinessPage
  }>(res)

  if (!res.ok) {
    throw new Error(json?.message || 'Failed to fetch public business page')
  }

  const data = json?.data

  if (!data || !('business' in data)) {
    throw new Error('Invalid public business page response')
  }

  return data
}

export async function searchPublicBusinesses(
  params: SearchPublicBusinessesParams
): Promise<PublicBusinessSearchResponse> {
  const searchParams = new URLSearchParams()

  if (params.q?.trim()) {
    searchParams.set('q', params.q.trim())
  }

  if (typeof params.lat === 'number' && !isNaN(params.lat)) {
    searchParams.set('lat', String(params.lat))
  }

  if (typeof params.lng === 'number' && !isNaN(params.lng)) {
    searchParams.set('lng', String(params.lng))
  }

  if (typeof params.radius_km === 'number' && params.radius_km > 0) {
    searchParams.set('radius_km', String(params.radius_km))
  }

  const url = `${API_BASE}/public/business/search${
    searchParams.toString() ? `?${searchParams.toString()}` : ''
  }`

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

  const data = json?.data

  if (!data || !Array.isArray(data.results) || !data.meta) {
    throw new Error('Invalid public business search response')
  }

  return data
}

export async function getPublicDigitalStore(
  slug: string
): Promise<PublicDigitalStoreResponse> {
  const res = await fetch(`${API_BASE}/public/digital-store/${slug}`, {
    method: 'GET',
    next: { revalidate: 60 },
    headers: {
      Connection: 'close',
    },
  })

  const json = await parseJson<{
    success?: boolean
    message?: string
    data?: PublicDigitalStoreResponse
  }>(res)

  if (!res.ok) {
    throw new Error(json?.message || 'Failed to fetch digital store')
  }

  const data = json?.data

  if (!data || !data.business || !Array.isArray(data.products)) {
    throw new Error('Invalid digital store response')
  }

  return data
}

export async function getPublicDigitalProduct(
  slug: string
): Promise<PublicDigitalProductResponse> {
  const res = await fetch(`${API_BASE}/public/digital-store/product/${slug}`, {
    method: 'GET',
    next: { revalidate: 60 },
    headers: {
      Connection: 'close',
    },
  })

  const json = await parseJson<{
    success?: boolean
    message?: string
    data?: PublicDigitalProductResponse
  }>(res)

  if (!res.ok) {
    throw new Error(json?.message || 'Failed to fetch digital product')
  }

  const data = json?.data

  if (!data || !data.id || !data.business) {
    throw new Error('Invalid digital product response')
  }

  return data
}

export async function initializeDigitalCheckout(
  productId: string,
  payload: InitializeDigitalCheckoutRequest
): Promise<InitializeDigitalCheckoutResponse> {
  const res = await fetch(
    `${API_BASE}/public/digital-store/${productId}/initialize-payment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    }
  )

  const json = await parseJson<InitializeDigitalCheckoutResponse>(res)

  if (!res.ok) {
    throw new Error(json?.message || 'Failed to initialize payment')
  }

  return json ?? { message: 'Payment initialized' }
}

export async function getOrderFulfillment(
  orderId: string,
  token: string
): Promise<PublicOrderFulfillmentResponse> {
  const qs = new URLSearchParams({ token })

  const res = await fetch(
    `${API_BASE}/public/digital-orders/${orderId}/fulfillment?${qs.toString()}`,
    {
      method: 'GET',
      cache: 'no-store',
    }
  )

  const json = await parseJson<PublicOrderFulfillmentResponse>(res)

  if (!res.ok) {
    throw new Error(json?.message || 'Failed to fetch fulfillment')
  }

  return json ?? { message: 'No fulfillment data returned' }
}

export function getTokenDownloadUrl(token: string): string {
  return `${API_BASE}/public/digital-downloads/${token}`
}