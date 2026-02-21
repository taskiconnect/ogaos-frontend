// src/lib/api/auth.ts
import api from './client'
import { RegisterRequest, LoginRequest, AuthResponse } from './types'

export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/register', data)
  return res.data
}

export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/login', data)
  return res.data
}

export const refreshToken = async (): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/refresh')
  return res.data
}

export const logoutUser = async (): Promise<void> => {
  await api.post('/auth/logout')
}

export const verifyEmail = async (token: string): Promise<{ message: string }> => {
  const res = await api.get<{ message: string }>('/auth/verify', {
    params: { token },
  })
  return res.data
}