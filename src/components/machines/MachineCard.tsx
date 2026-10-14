'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, CheckCircle2, Clock3, Loader2, Play } from 'lucide-react';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatClockTime, formatCountdown } from '@/lib/time';
import { getMachineTypeIcon, getMachineTypeLabel, type LiveMachineState } from '@/lib/machine';
import { useStartMachine, useStopMachine } from '@/hooks/useMachines';
import { usePrograms } from '@/hooks/usePrograms';
import { useNotificationStore } from '@/stores/notificationStore';
import { ApiError } from '@/services/apiClient';
import type { Machine } from '@/types/machine';

interface MachineCardProps {
  machine: Machine;
  live: LiveMachineState;
}

const ACCENT_BORDER_CLASS: Record<string, string> = {
  AVAILABLE: 'border-l-emerald-400',
  RUNNING: 'border-l-sky-400',
  COMPLETED: 'border-l-amber-400',
  MAINTENANCE: 'border-l-rose-400',
};

// Geo-generated "nearby" stores (src/mocks/virtualStores.ts, prefix 'geo-')
// are a procedurally generated demo, not real DB rows - the start/stop API
// rejects them, so the picker/start action is hidden for those machines.
function isVirtualMachine(machine: Machine): boolean {
  return machine.storeId.startsWith('geo-');
}

export function MachineCard({ machine, live }: MachineCardProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // A new cycle started (or the server confirmed completion itself) -
  // drop any earlier "확인했어요" override so the real status shows again.
  useEffect(() => {
    setAcknowledged(false);
  }, [machine.startedAt, machine.status]);

  const isSubscribed = useNotificationStore((state) => state.isSubscribed(machine.id));
  const toggleSubscription = useNotificationStore((state) => state.toggleSubscription);
  const notifyIfDue = useNotificationStore((state) => state.notifyIfDue);
  const resetNotification = useNotificationStore((state) => state.resetNotification);

  const startMachine = useStartMachine(machine.storeId);
  const stopMachine = useStopMachine(machine.storeId);
  const programsQuery = usePrograms(machine.storeId, machine.type, pickerOpen);

  useEffect(() => {
    if (live.status === 'RUNNING') {
      notifyIfDue(
        machine.id,
        `${getMachineTypeLabel(machine.type)} ${String(machine.machineNumber).padStart(2, '0')}번 종료 5분 전`,
        live.remainingSeconds,
      );
    } else {
      resetNotification(machine.id);
    }
  }, [
    live.status,
    live.remainingSeconds,
    machine.id,
    machine.type,
    machine.machineNumber,
    notifyIfDue,
    resetNotification,
  ]);

  const displayStatus = acknowledged ? 'AVAILABLE' : live.status;
  const typeLabel = getMachineTypeLabel(machine.type);
  const numberLabel = String(machine.machineNumber).padStart(2, '0');
  const TypeIcon = getMachineTypeIcon(machine.type);

  function handleConfirmPickup() {
    setAcknowledged(true);
    // Virtual (geo-demo) machines have no real DB row to stop - the local
    // acknowledgement above is the only state they ever had.
    if (isVirtualMachine(machine)) return;
    stopMachine.mutate(machine.id, { onError: () => setAcknowledged(false) });
  }

  function handlePickProgram(programId: string) {
    startMachine.mutate(
      { machineId: machine.id, programId },
      { onSuccess: () => setPickerOpen(false) },
    );
  }

  const startErrorMessage =
    startMachine.isError && startMachine.error instanceof ApiError ? startMachine.error.message : null;

  return (
    <article
      className={`flex flex-col gap-3 rounded-2xl border border-l-4 border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 ${ACCENT_BORDER_CLASS[displayStatus]} dark:bg-slate-900`}
    >
      <header className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <TypeIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
          {typeLabel} {numberLabel}
        </h3>
        <StatusBadge status={displayStatus} type={machine.type} />
      </header>

      {displayStatus === 'AVAILABLE' && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-1.5">
            <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              바로 사용할 수 있어요
            </p>
            <p className="text-xs text-slate-400">{machine.price.toLocaleString()}원</p>
          </div>

          {!isVirtualMachine(machine) && !pickerOpen && (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              시작하기
            </button>
          )}

          {pickerOpen && (
            <div className="flex flex-col gap-1.5 rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">코스를 선택해주세요</p>

              {programsQuery.isPending && (
                <p className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  코스 불러오는 중...
                </p>
              )}

              {programsQuery.isError && <p className="text-xs text-rose-500">코스를 불러오지 못했습니다.</p>}

              {programsQuery.data?.length === 0 && (
                <p className="text-xs text-slate-400">등록된 코스가 없습니다.</p>
              )}

              {programsQuery.data?.map((program) => (
                <button
                  key={program.id}
                  type="button"
                  disabled={startMachine.isPending}
                  onClick={() => handlePickProgram(program.id)}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs transition-colors hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-emerald-500/10"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {program.name} · {program.durationMinutes}분
                  </span>
                  <span className="text-slate-400">{program.price.toLocaleString()}원</span>
                </button>
              ))}

              {startErrorMessage && <p className="text-xs text-rose-500">{startErrorMessage}</p>}

              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="w-fit text-[11px] text-slate-400 underline"
              >
                취소
              </button>
            </div>
          )}
        </div>
      )}

      {displayStatus === 'RUNNING' && (
        <div className="flex flex-col gap-2">
          {machine.program && <p className="text-xs text-slate-400">{machine.program} 코스</p>}
          <p className="text-3xl font-extrabold tabular-nums tracking-tight text-sky-600 dark:text-sky-400">
            {formatCountdown(live.remainingSeconds)}
          </p>
          <ProgressBar progress={live.progress} label={`${typeLabel} ${numberLabel} 진행률`} />
          {live.estimatedEndAt && (
            <p className="flex items-center gap-1 text-xs text-slate-400">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              예상 종료 {formatClockTime(live.estimatedEndAt)}
            </p>
          )}
          <button
            type="button"
            onClick={() => toggleSubscription(machine.id)}
            aria-pressed={isSubscribed}
            className={`mt-1 inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              isSubscribed
                ? 'bg-sky-600 text-white hover:bg-sky-700'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {isSubscribed ? (
              <Bell className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <BellOff className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {isSubscribed ? '종료 알림 설정됨' : '종료 알림 받기'}
          </button>
        </div>
      )}

      {displayStatus === 'COMPLETED' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-amber-600 dark:text-amber-400">세탁물을 수거해주세요</p>
          <button
            type="button"
            disabled={isVirtualMachine(machine) ? false : stopMachine.isPending}
            onClick={handleConfirmPickup}
            className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-200 disabled:opacity-50 dark:bg-amber-500/10 dark:text-amber-400"
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            확인했어요
          </button>
        </div>
      )}

      {displayStatus === 'MAINTENANCE' && (
        <p className="text-xs text-rose-500">기기 점검이 필요합니다. 관리자에게 문의해주세요.</p>
      )}
    </article>
  );
}
