// src/stores/adminAuthStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AdminProfile } from '@/types/admin'

interface AdminAuthState {
  user: AdminProfile | null
  accessToken: string | null
  isAuthenticated: boolean
  tempToken: string | null
  otpRequired: boolean

  setUser: (user: AdminProfile | null) => void
  setAccessToken: (token: string | null) => void
  setTempToken: (token: string | null) => void
  setOTPRequired: (required: boolean) => void
  clearAuth: () => void
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      tempToken: null,
      otpRequired: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAccessToken: (token) => set({ accessToken: token }),
      setTempToken: (tempToken) => set({ tempToken }),
      setOTPRequired: (otpRequired) => set({ otpRequired }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          tempToken: null,
          otpRequired: false,
        }),
    }),
    {
      name: 'ogaos-admin-auth-storage',
      // Persist the token so the axios interceptor can rehydrate it on refresh.
      // tempToken and otpRequired are ephemeral flow state — never persisted.
      partialize: (state) => ({
        user:            state.user,
        accessToken:     state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)