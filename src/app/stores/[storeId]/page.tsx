'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, Star, WashingMachine, Wind } from 'lucide-react';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { FilterBar } from '@/components/machines/FilterBar';
import { SortSelect } from '@/components/machines/SortSelect';
import { MachineSection } from '@/components/machines/MachineSection';
import { StoreStatusSummary } from '@/components/stores/StoreStatusSummary';
import { ErrorState } from '@/components/ui/ErrorState';
import { MachineCardSkeleton } from '@/components/ui/Skeleton';
import { useMachines } from '@/hooks/useMachines';
import { useStore } from '@/hooks/useStore';
import { useNow } from '@/hooks/useNow';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useLaundryUiStore } from '@/stores/laundryUiStore';
import {
  computeLiveState,
  filterLiveMachinesByStatus,
  sortLiveMachines,
  type LiveMachine,
} from '@/lib/machine';

interface StoreDetailPageProps {
  params: { storeId: string };
}

function StoreDetailContent({ params }: StoreDetailPageProps) {
  const { storeId } = params;
  const now = useNow(1000);

  const { data: store } = useStore(storeId);
  const { data: machines, isPending, isError, refetch } = useMachines(storeId);

  const isFavorite = useFavoritesStore((state) => state.isFavorite(storeId));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const typeFilter = useLaundryUiStore((state) => state.typeFilter);
  const statusFilter = useLaundryUiStore((state) => state.statusFilter);
  const sortOption = useLaundryUiStore((state) => state.sortOption);

  const liveMachines: LiveMachine[] = useMemo(
    () => (machines ?? []).map((machine) => ({ machine, live: computeLiveState(machine, now) })),
    [machines, now],
  );

  const washers = useMemo(
    () =>
      sortLiveMachines(
        filterLiveMachinesByStatus(
          liveMachines.filter((item) => item.machine.type === 'WASHER'),
          statusFilter,
        ),
        sortOption,
      ),
    [liveMachines, statusFilter, sortOption],
  );

  const dryers = useMemo(
    () =>
      sortLiveMachines(
        filterLiveMachinesByStatus(
          liveMachines.filter((item) => item.machine.type === 'DRYER'),
          statusFilter,
        ),
        sortOption,
      ),
    [liveMachines, statusFilter, sortOption],
  );

  const summary = useMemo(() => {
    const allWashers = liveMachines.filter((item) => item.machine.type === 'WASHER');
    const allDryers = liveMachines.filter((item) => item.machine.type === 'DRYER');
    return {
      washerAvailable: allWashers.filter((item) => item.live.status === 'AVAILABLE').length,
      washerTotal: allWashers.length,
      dryerAvailable: allDryers.filter((item) => item.live.status === 'AVAILABLE').length,
      dryerTotal: allDryers.length,
    };
  }, [liveMachines]);

  const showWashers = typeFilter === 'ALL' || typeFilter === 'WASHER';
  const showDryers = typeFilter === 'ALL' || typeFilter === 'DRYER';

  return (
    <main className="flex flex-col gap-5 pb-10">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <Link
          href="/home"
          className="flex min-w-0 items-center gap-1 text-sm font-bold text-slate-800 dark:text-slate-100"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{store?.name ?? '세탁소'}</span>
        </Link>
        <button
          type="button"
          onClick={() => toggleFavorite(storeId)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          className="shrink-0 rounded-full p-1 text-slate-300 transition-colors hover:text-amber-400"
        >
          <Star
            className={`h-5 w-5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
            aria-hidden="true"
          />
        </button>
      </header>

      <div className="flex flex-col gap-5 px-4">
        {!isPending && !isError && (
          <StoreStatusSummary
            washerAvailable={summary.washerAvailable}
            washerTotal={summary.washerTotal}
            dryerAvailable={summary.dryerAvailable}
            dryerTotal={summary.dryerTotal}
          />
        )}

        <div className="flex flex-col gap-3">
          <FilterBar />
          <SortSelect />
        </div>

        {isPending && (
          <div className="grid grid-cols-1 gap-3">
            <MachineCardSkeleton />
            <MachineCardSkeleton />
            <MachineCardSkeleton />
            <MachineCardSkeleton />
          </div>
        )}

        {isError && <ErrorState message="기기 정보를 불러오지 못했습니다." onRetry={() => refetch()} />}

        {!isPending && !isError && (
          <>
            {showWashers && (
              <MachineSection
                title="세탁기"
                icon={WashingMachine}
                availableCount={summary.washerAvailable}
                totalCount={summary.washerTotal}
                items={washers}
              />
            )}
            {showDryers && (
              <MachineSection
                title="건조기"
                icon={Wind}
                availableCount={summary.dryerAvailable}
                totalCount={summary.dryerTotal}
                items={dryers}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function StoreDetailPage(props: StoreDetailPageProps) {
  return (
    <RequireAuth>
      <StoreDetailContent {...props} />
    </RequireAuth>
  );
}
