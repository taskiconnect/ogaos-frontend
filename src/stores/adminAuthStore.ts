import { clearPrivateCache } from '@/lib/query-client'
// src/stores/adminAuthStore.ts
import type { AdminProfile } from '@/types/admin'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      tempToken: null,
      otpRequired: false,

      setUser: (user) => {
        if (get().user?.id !== user?.id) clearPrivateCache()
        set({ user, isAuthenticated: !!user })
      },
      setAccessToken: (token) => set({ accessToken: token }),
      setTempToken: (tempToken) => set({ tempToken }),
      setOTPRequired: (otpRequired) => set({ otpRequired }),

      clearAuth: () => {
        clearPrivateCache()
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          tempToken: null,
          otpRequired: false,
        })
      },
    }),
    {
      name: 'ogaos-admin-auth-storage',
      version: 1,
      migrate: (value) => {
        const old = value as Partial<AdminAuthState>
        return { user: old.user ?? null, isAuthenticated: !!old.user, accessToken: null }
      },
      // Only the profile is persisted. Access tokens stay in memory.
      // tempToken and otpRequired are ephemeral flow state — never persisted.
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
