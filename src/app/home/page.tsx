'use client';

import { useMemo } from 'react';
import { LocateFixed, MapPin, WashingMachine } from 'lucide-react';

import { AuthStatus } from '@/components/auth/AuthStatus';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { StoreCard } from '@/components/stores/StoreCard';
import { StoreCardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useStores } from '@/hooks/useStores';
import { useFavoritesStore } from '@/stores/favoritesStore';

function HomeContent() {
  const geolocation = useGeolocation();
  const coords = geolocation.status === 'granted' ? (geolocation.coords ?? undefined) : undefined;

  const { data: stores, isPending, isError, refetch } = useStores(coords);
  const favoriteStoreIds = useFavoritesStore((state) => state.favoriteStoreIds);

  const sortedStores = useMemo(() => {
    if (!stores) return [];
    return [...stores].sort((a, b) => {
      const aFavorite = favoriteStoreIds.includes(a.id) ? 0 : 1;
      const bFavorite = favoriteStoreIds.includes(b.id) ? 0 : 1;
      return aFavorite - bFavorite;
    });
  }, [stores, favoriteStoreIds]);

  const locationLabel = coords ? '내 위치 주변' : '광진구 자양동 인근';

  return (
    <main className="flex flex-col pb-10">
      <header className="flex items-center justify-between gap-2 bg-gradient-to-br from-sky-500 to-sky-600 px-4 pb-6 pt-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <WashingMachine className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white">LaundON</h1>
            <p className="flex items-center gap-1 text-[11px] text-sky-100">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {locationLabel}
            </p>
          </div>
        </div>
        <AuthStatus />
      </header>

      <section aria-label="내 주변 세탁소" className="flex flex-col gap-3 px-4 pt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300">내 주변 세탁소</h2>
          {geolocation.status === 'pending' && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <LocateFixed className="h-3 w-3 animate-pulse" aria-hidden="true" />
              위치 확인 중...
            </span>
          )}
        </div>

        {(geolocation.status === 'denied' || geolocation.status === 'unsupported') && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-sky-50 px-3 py-2.5 text-xs dark:bg-sky-500/10">
            <span className="text-sky-700 dark:text-sky-400">
              위치 권한을 허용하면 내 주변 세탁소를 보여드려요
            </span>
            {geolocation.status === 'denied' && (
              <button
                type="button"
                onClick={geolocation.request}
                className="shrink-0 rounded-full bg-sky-600 px-2.5 py-1 font-medium text-white transition-colors hover:bg-sky-700"
              >
                다시 시도
              </button>
            )}
          </div>
        )}

        {isPending && (
          <div className="flex flex-col gap-3">
            <StoreCardSkeleton />
            <StoreCardSkeleton />
          </div>
        )}

        {isError && <ErrorState message="세탁소 목록을 불러오지 못했습니다." onRetry={() => refetch()} />}

        {!isPending && !isError && sortedStores.length === 0 && (
          <EmptyState title="주변에 등록된 세탁소가 없어요" />
        )}

        {!isPending && !isError && sortedStores.length > 0 && (
          <div className="flex flex-col gap-3">
            {sortedStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function HomePage() {
  return (
    <RequireAuth>
      <HomeContent />
    </RequireAuth>
  );
}
