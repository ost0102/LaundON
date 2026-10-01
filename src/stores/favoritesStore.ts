import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favoriteStoreIds: string[];
  toggleFavorite: (storeId: string) => void;
  isFavorite: (storeId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteStoreIds: [],
      toggleFavorite: (storeId) =>
        set((state) => ({
          favoriteStoreIds: state.favoriteStoreIds.includes(storeId)
            ? state.favoriteStoreIds.filter((id) => id !== storeId)
            : [...state.favoriteStoreIds, storeId],
        })),
      isFavorite: (storeId) => get().favoriteStoreIds.includes(storeId),
    }),
    {
      name: 'laundry-now:favorites',
      // Server and first client render must agree on the initial (empty)
      // state - localStorage only exists on the client. We rehydrate
      // manually after mount (see FavoritesHydrator) instead of letting
      // persist read it synchronously, which would mismatch the SSR HTML.
      skipHydration: true,
    },
  ),
);
