// src/lib/api/client.ts
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { useAuthStore } from '../../stores/authStore'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 10000,
})

// ─── Attach access token to every request ────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token: string | null = useAuthStore.getState().accessToken
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, token ? '✓ auth' : '✗ no token')
  }
  return config
})

// ─── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn('[API] 401 – token expired or missing')
      useAuthStore.getState().clearAuth()
      if (typeof window !== 'undefined') window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

export default api