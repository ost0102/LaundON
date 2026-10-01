'use client';

import { useState, type FormEvent } from 'react';
import { Search, X } from 'lucide-react';

import { useGeocodeAddress } from '@/hooks/useGeocode';
import { ApiError } from '@/services/apiClient';
import type { Coordinates } from '@/lib/geo';

interface AddressSearchProps {
  onLocationFound: (coords: Coordinates, label: string) => void;
  onClear: () => void;
  isActive: boolean;
}

export function AddressSearch({ onLocationFound, onClear, isActive }: AddressSearchProps) {
  const geocode = useGeocodeAddress();
  const [query, setQuery] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (query.trim().length === 0) return;

    geocode.mutate(query, {
      onSuccess: (data) => onLocationFound({ lat: data.lat, lng: data.lng }, data.displayName),
    });
  }

  const errorMessage = geocode.isError && geocode.error instanceof ApiError ? geocode.error.message : null;

  return (
    <div className="flex flex-col gap-1.5">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="주소로 검색 (예: 관악구 남현동)"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs transition-colors focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-sky-500/20"
          />
        </div>
        {isActive ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onClear();
            }}
            aria-label="검색 초기화"
            className="shrink-0 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={geocode.isPending || query.trim().length === 0}
            className="shrink-0 whitespace-nowrap rounded-lg bg-sky-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
          >
            {geocode.isPending ? '검색 중...' : '검색'}
          </button>
        )}
      </form>

      {errorMessage && <p className="text-xs text-rose-500">{errorMessage}</p>}
    </div>
  );
}
