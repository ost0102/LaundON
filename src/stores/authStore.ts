import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AuthUser } from '@/types/auth';

interface AuthState {
  user: AuthUser | null;
  /** True once the persisted session has been read from localStorage (see AppHydrator). */
  hasHydrated: boolean;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'laundry-now:auth',
      // See favoritesStore - server/first-client render must match, so the
      // persisted session is pulled in after mount (AppHydrator), not here.
      // Route guards wait on `hasHydrated` to avoid bouncing an already
      // logged-in user to /login before their session has been read.
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
