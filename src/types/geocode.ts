export interface GeocodeResponse {
  lat: number;
  lng: number;
  /** Full address string as resolved by the geocoding provider. */
  displayName: string;
}
