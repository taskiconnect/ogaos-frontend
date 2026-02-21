// src/lib/api/client.ts
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
})

if (process.env.NODE_ENV === 'development') {
  api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  })
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized - token likely expired')
    }
    return Promise.reject(error)
  }
)

export default api