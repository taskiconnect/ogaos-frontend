// src/lib/api/client.ts
import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 10000,
})

// ─── Request interceptor: attach Bearer token ─────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useAuthStore } = require('@/stores/authStore')
    const token: string | null = useAuthStore.getState().accessToken

    if (token) {
      config.headers = config.headers ?? {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
  } catch {
    // Store not yet hydrated — request goes out without token
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
  }

  return config
})

// ─── Response interceptor: silent token refresh on 401 ────────────────────────
let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

function processQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token))
  refreshQueue = []
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<any>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle upgrade / subscription gate
    if (error.response?.status === 402) {
      const data = error.response?.data

      if (typeof window !== 'undefined' && data?.upgrade_required) {
        const params = new URLSearchParams()

        if (data.feature) params.set('feature', data.feature)
        if (data.required_plan) params.set('required_plan', data.required_plan)
        if (data.current_plan) params.set('current_plan', data.current_plan)
        if (data.message) params.set('message', data.message)

        window.location.href = `/dashboard/subscription?${params.toString()}`
      }

      return Promise.reject(error)
    }

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    // Never retry auth endpoints — avoids infinite loops
    if (
      original.url?.includes('/auth/refresh') ||
      original.url?.includes('/auth/login') ||
      original.url?.includes('/auth/register') ||
      original.url?.includes('/auth/verify') ||
      original.url?.includes('/auth/resend-verification')
    ) {
      return Promise.reject(error)
    }

    original._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (token) {
            original.headers = original.headers ?? {}
            original.headers['Authorization'] = `Bearer ${token}`
            resolve(api(original))
          } else {
            reject(error)
          }
        })
      })
    }

    isRefreshing = true

    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) throw new Error('Refresh failed')

      const data = await res.json()
      const newToken =
        (data?.access_token as string | undefined) ??
        (data?.data?.access_token as string | undefined)

      if (!newToken) throw new Error('No access_token in refresh response')

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useAuthStore } = require('@/stores/authStore')
      useAuthStore.getState().setAccessToken(newToken)

      processQueue(newToken)

      original.headers = original.headers ?? {}
      original.headers['Authorization'] = `Bearer ${newToken}`

      return api(original)
    } catch {
      processQueue(null)

      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { useAuthStore } = require('@/stores/authStore')
        useAuthStore.getState().clearAuth()
      } catch {}

      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }

      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)

export default api