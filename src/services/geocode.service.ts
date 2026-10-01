import { apiGet } from '@/services/apiClient';
import type { GeocodeResponse } from '@/types/geocode';

export async function geocodeAddress(query: string): Promise<GeocodeResponse> {
  return apiGet<GeocodeResponse>(`/api/geocode?q=${encodeURIComponent(query)}`);
}
