import { useMutation } from '@tanstack/react-query';

import { geocodeAddress } from '@/services/geocode.service';

export function useGeocodeAddress() {
  return useMutation({ mutationFn: geocodeAddress });
}
