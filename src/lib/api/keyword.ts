import api from './client'
import type {
  BusinessKeywordsResponse,
  SetBusinessKeywordsRequest,
} from './types'

export async function getMyBusinessKeywords(): Promise<string[]> {
  const response = await api.get<BusinessKeywordsResponse>('/business/me/keywords')
  return response.data.data.keywords ?? []
}

export async function setMyBusinessKeywords(
  payload: SetBusinessKeywordsRequest
): Promise<string[]> {
  const response = await api.put<BusinessKeywordsResponse>(
    '/business/me/keywords',
    payload
  )
  return response.data.data.keywords ?? []
}

export async function getPublicBusinessKeywords(slug: string): Promise<string[]> {
  const response = await api.get<BusinessKeywordsResponse>(
    `/public/business/${encodeURIComponent(slug)}/keywords`
  )
  return response.data.data.keywords ?? []
}

export async function suggestKeywords(query: string): Promise<string[]> {
  const response = await api.get<BusinessKeywordsResponse>(
    `/public/keywords/suggestions?q=${encodeURIComponent(query)}`
  )
  return response.data.data.keywords ?? []
}