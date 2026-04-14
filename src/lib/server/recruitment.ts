import { cache } from 'react'
import { headers } from 'next/headers'
import type {
  ApiCursorList,
  ApiSuccess,
  JobOpening,
  PublicJobItem,
} from '@/lib/api/types'

type PublicJobsQuery = {
  q?: string
  type?: string
  location?: string
  is_remote?: string
  cursor?: string
  limit?: string
}

async function getBaseUrl() {
  const h = await headers()

  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto =
    h.get('x-forwarded-proto') ??
    (process.env.NODE_ENV === 'development' ? 'http' : 'https')

  if (!host) {
    return 'http://localhost:3000'
  }

  return `${proto}://${host}`
}

function buildInternalUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, string | undefined>
) {
  const url = new URL(path, baseUrl)

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, value)
    }
  })

  return url.toString()
}

export const getPublicJobsSSR = cache(async (params?: PublicJobsQuery) => {
  const baseUrl = await getBaseUrl()

  const response = await fetch(
    buildInternalUrl(baseUrl, '/api/public/jobs', params),
    {
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch public jobs')
  }

  const json = (await response.json()) as ApiCursorList<PublicJobItem>
  return json
})

export const getPublicJobSSR = cache(async (slug: string) => {
  const baseUrl = await getBaseUrl()

  const response = await fetch(
    buildInternalUrl(baseUrl, `/api/public/jobs/${slug}`),
    {
      cache: 'no-store',
    }
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error('Failed to fetch public job')
  }

  const json = (await response.json()) as ApiSuccess<JobOpening>
  return json.data
})