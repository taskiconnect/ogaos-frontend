// src/stores/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MeResponse } from '@/lib/api/types'

interface AuthState {
  user:            MeResponse | null
  accessToken:     string | null
  isAuthenticated: boolean
  setUser:         (user: MeResponse | null) => void
  setAccessToken:  (token: string | null) => void
  clearAuth:       () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      accessToken:     null,
      isAuthenticated: false,

      setUser:        (user)  => set({ user, isAuthenticated: !!user }),
      setAccessToken: (token) => set({ accessToken: token }),
      clearAuth:      ()      => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'ogaos-auth-storage',
      // Persist user profile so greeting shows immediately on refresh.
      // Never persist accessToken — stays in memory only.
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
