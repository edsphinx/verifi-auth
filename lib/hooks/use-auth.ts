'use client';

/**
 * Main authentication hook with session management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthSession, AuthStatus } from '../types';

interface AuthStore {
  session: AuthSession | null;
  status: AuthStatus;
  setSession: (session: AuthSession | null) => void;
  setStatus: (status: AuthStatus) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      session: null,
      status: 'loading',
      setSession: (session) => set({
        session,
        status: session ? 'authenticated' : 'unauthenticated'
      }),
      setStatus: (status) => set({ status }),
      logout: () => set({ session: null, status: 'unauthenticated' }),
    }),
    {
      name: 'verifi-auth-storage',
      partialize: (state) => ({ session: state.session }),
    }
  )
);

export function useAuth() {
  const { session, status, setSession, logout } = useAuthStore();

  return {
    session,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    address: session?.address,
    userId: session?.userId,
    setSession,
    logout,
  };
}
