'use client';

import { useEffect } from 'react';

import { useAuthStore } from '@/stores/authStore';
import { useFavoritesStore } from '@/stores/favoritesStore';

/** Pulls persisted client state (favorites, session) from localStorage after mount. */
export function AppHydrator() {
  useEffect(() => {
    useFavoritesStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
  }, []);

  return null;
}
