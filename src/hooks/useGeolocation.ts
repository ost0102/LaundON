'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Coordinates } from '@/lib/geo';

export type GeolocationStatus = 'idle' | 'pending' | 'granted' | 'denied' | 'unsupported';

interface GeolocationState {
  status: GeolocationStatus;
  coords: Coordinates | null;
  request: () => void;
}

/** Requests the browser's geolocation once and exposes it, with a manual retry. */
export function useGeolocation(autoRequest = true): GeolocationState {
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [coords, setCoords] = useState<Coordinates | null>(null);

  const request = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unsupported');
      return;
    }

    setStatus('pending');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStatus('granted');
      },
      () => {
        setStatus('denied');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  useEffect(() => {
    if (autoRequest) request();
    // Only auto-request once on mount - `request` is stable (no deps).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, coords, request };
}
