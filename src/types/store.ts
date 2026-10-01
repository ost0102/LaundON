export interface Store {
  id: string;
  name: string;
  address: string;
}

export interface StoreSummary extends Store {
  washerAvailableCount: number;
  washerTotalCount: number;
  dryerAvailableCount: number;
  dryerTotalCount: number;
  /** Straight-line distance from the requester's coordinates, in meters. Only set when a location was provided. */
  distanceMeters?: number;
}

export interface StoreListResponse {
  stores: StoreSummary[];
}

export interface StoreDetailResponse {
  store: Store;
}
