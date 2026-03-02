// src/lib/store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MeResponse } from '@/lib/api/types'

interface AuthState {
  user: MeResponse | null
  accessToken: string | null
  isAuthenticated: boolean
  setUser: (user: MeResponse | null) => void
  setAccessToken: (token: string | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      // Store token only in memory (not persisted to localStorage)
      setAccessToken: (token) => set({ accessToken: token }),

      clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'ogaos-auth-storage',
      // Only persist user profile — never the access token
      partialize: (state) => ({ user: state.user }),
    }
  )
)