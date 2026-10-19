import axios from 'axios'
export class ApiError extends Error {
  readonly status?: number
  readonly response?: { status?: number; data: Record<string, unknown> }
  readonly type: 'api' | 'subscription'
  constructor(message: string, status?: number, data: Record<string, unknown> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.response = { status, data: { ...data, message } }
    this.type = status === 402 ? 'subscription' : 'api'
  }
}
export function asApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    const body = data && typeof data === 'object' ? (data as Record<string, unknown>) : {}
    return new ApiError(
      typeof body.message === 'string' ? body.message : error.message,
      error.response?.status,
      body,
    )
  }
  return new ApiError(error instanceof Error ? error.message : 'The request could not be completed')
}
export function handleApiError(error: unknown): never {
  throw asApiError(error)
}
