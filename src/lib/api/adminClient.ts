// src/lib/api/adminClient.ts
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 10000,
})

// ─── Request interceptor: attach Admin token ───────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useAdminAuthStore } = require('@/stores/adminAuthStore')
    const token = useAdminAuthStore.getState().accessToken

    if (token) {
      config.headers = config.headers ?? {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
  } catch {
    // Store not hydrated yet — safe
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[ADMIN API] ${config.method?.toUpperCase()} ${config.url}`)
  }

  return config
})

// ─── Response interceptor: silent refresh on 401 (Admin only) ───────────────
let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

function processQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token))
  refreshQueue = []
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    // Never retry admin auth endpoints
    if (
      original.url?.includes('/admin/auth/refresh') ||
      original.url?.includes('/admin/auth/login') ||
      original.url?.includes('/admin/auth/verify-otp')
    ) {
      return Promise.reject(error)
    }

    original._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (token) {
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
      const res = await fetch('/api/admin/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) throw new Error('Admin refresh failed')

      const data = await res.json()
      const newToken = data?.access_token ?? data?.data?.access_token

      if (!newToken) throw new Error('No access_token returned')

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useAdminAuthStore } = require('@/stores/adminAuthStore')
      useAdminAuthStore.getState().setAccessToken(newToken)

      processQueue(newToken)

      original.headers['Authorization'] = `Bearer ${newToken}`
      return api(original)
    } catch {
      processQueue(null)
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { useAdminAuthStore } = require('@/stores/adminAuthStore')
        useAdminAuthStore.getState().clearAuth()
      } catch {}

      if (typeof window !== 'undefined') {
        window.location.href = '/admin/auth/login'
      }
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)

export default api