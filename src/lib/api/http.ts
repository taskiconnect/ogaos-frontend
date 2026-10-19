import { useAdminAuthStore } from '@/stores/adminAuthStore'
import { useAuthStore } from '@/stores/authStore'
import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios'
import { ApiError, asApiError } from './errors'

type Retriable = InternalAxiosRequestConfig & { _retry?: boolean }
const refreshes: Partial<Record<'user' | 'admin', Promise<string>>> = {}
export function refreshSession(scope: 'user' | 'admin'): Promise<string> {
  if (refreshes[scope]) return refreshes[scope]!
  refreshes[scope] = (async () => {
    const path = scope === 'admin' ? '/api/admin/auth/refresh' : '/api/auth/refresh'
    const res = await fetch(path, {
      method: 'POST',
      credentials: 'include',
      signal: AbortSignal.timeout(10_000),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok)
      throw new ApiError(body.message || 'Session could not be restored', res.status, body)
    const token = body.access_token ?? body.data?.access_token
    if (typeof token !== 'string') throw new ApiError('Invalid session response', 502)
    const store = scope === 'admin' ? useAdminAuthStore : useAuthStore
    store.getState().setAccessToken(token)
    return token
  })().finally(() => {
    delete refreshes[scope]
  })
  return refreshes[scope]!
}
export function createApiClient(scope: 'user' | 'admin', baseURL?: string) {
  const client = axios.create({ baseURL, withCredentials: true, timeout: 15_000 })
  const store = scope === 'admin' ? useAdminAuthStore : useAuthStore
  client.interceptors.request.use((config) => {
    const token = store.getState().accessToken
    if (token) config.headers.set('Authorization', `Bearer ${token}`)
    // Let the browser create the multipart boundary.
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      config.headers.delete('Content-Type')
      config.timeout = 65_000
    }
    return config
  })
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as Retriable | undefined
      const status = error.response?.status
      const authCall = /\/auth\/(login|register|refresh|verify|resend|setup)/.test(
        original?.url ?? '',
      )
      if (status !== 401 || !original || original._retry || authCall) throw asApiError(error)
      original._retry = true
      try {
        const token = await refreshSession(scope)
        original.headers = AxiosHeaders.from(original.headers)
        original.headers.set('Authorization', `Bearer ${token}`)
      } catch (failure) {
        const normalized = asApiError(failure)
        if ([401, 403].includes(normalized.status ?? 0)) store.getState().clearAuth()
        throw normalized
      }
      return client(original)
    },
  )
  return client
}
