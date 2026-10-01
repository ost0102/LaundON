'use client';

import Link from 'next/link';
import { ChevronRight, Footprints, MapPin, Star, WashingMachine, Wind } from 'lucide-react';

import { useFavoritesStore } from '@/stores/favoritesStore';
import { estimateWalkMinutes, formatDistance } from '@/lib/geo';
import type { StoreSummary } from '@/types/store';

export function StoreCard({ store }: { store: StoreSummary }) {
  const isFavorite = useFavoritesStore((state) => state.isFavorite(store.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const totalAvailable = store.washerAvailableCount + store.dryerAvailableCount;

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{store.name}</h3>
          {store.distanceMeters !== undefined ? (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400">
              <Footprints className="h-3 w-3 shrink-0" aria-hidden="true" />
              도보 {estimateWalkMinutes(store.distanceMeters)}분 · {formatDistance(store.distanceMeters)}
            </p>
          ) : (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              {store.address}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => toggleFavorite(store.id)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          className="shrink-0 rounded-full p-1 text-slate-300 transition-colors hover:text-amber-400"
        >
          <Star
            className={`h-5 w-5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
        {totalAvailable > 0 ? `현재 사용 가능 (${totalAvailable}대)` : '현재 모든 기기 사용 중'}
      </p>

      <dl className="flex gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <WashingMachine className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <dt className="sr-only">세탁기</dt>
          <dd className="font-semibold">
            {store.washerAvailableCount}/{store.washerTotalCount}대
          </dd>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <dt className="sr-only">건조기</dt>
          <dd className="font-semibold">
            {store.dryerAvailableCount}/{store.dryerTotalCount}대
          </dd>
        </div>
      </dl>

      <Link
        href={`/stores/${store.id}`}
        className="mt-1 flex items-center justify-center gap-1 rounded-lg bg-sky-600 px-3 py-2 text-center text-xs font-semibold text-white shadow-sm shadow-sky-200 transition-colors hover:bg-sky-700 dark:shadow-none"
      >
        세탁소 보기
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </article>
  );
}
