import { apiGet } from '@/services/apiClient';
import type { Coordinates } from '@/lib/geo';
import type { Store, StoreDetailResponse, StoreListResponse, StoreSummary } from '@/types/store';

export async function getStores(coords?: Coordinates): Promise<StoreSummary[]> {
  const query = coords ? `?lat=${coords.lat}&lng=${coords.lng}` : '';
  const data = await apiGet<StoreListResponse>(`/api/stores${query}`);
  return data.stores;
}

export async function getStore(storeId: string): Promise<Store> {
  const data = await apiGet<StoreDetailResponse>(`/api/stores/${storeId}`);
  return data.store;
}
