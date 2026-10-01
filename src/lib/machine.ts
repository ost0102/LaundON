import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  PackageCheck,
  WashingMachine,
  Wind,
  type LucideIcon,
} from 'lucide-react';

import type { Machine, MachineStatus, MachineType } from '@/types/machine';
import type { MachineSortOption, MachineStatusFilter } from '@/stores/laundryUiStore';

export interface LiveMachineState {
  status: MachineStatus;
  remainingSeconds: number;
  progress: number;
  estimatedEndAt: string | null;
}

/**
 * Derives the "as of right now" state of a machine purely from the last
 * server payload and the current clock - never by decrementing a
 * previously-rendered number. This is what keeps the countdown accurate
 * even if the last refetch was several seconds ago, and is also what lets
 * the UI predict a RUNNING -> FINISHED transition before the IoT server
 * confirms it (see spec section 5 & 6).
 */
export function computeLiveState(machine: Machine, now: number): LiveMachineState {
  if (machine.status === 'RUNNING' && machine.estimatedEndAt) {
    const endMs = new Date(machine.estimatedEndAt).getTime();
    const remainingSeconds = Math.max(0, Math.floor((endMs - now) / 1000));
    const totalDuration = machine.totalDuration ?? remainingSeconds;
    const elapsed = totalDuration - remainingSeconds;
    const progress =
      totalDuration > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100))) : 100;

    return {
      status: remainingSeconds <= 0 ? 'FINISHED' : 'RUNNING',
      remainingSeconds,
      progress,
      estimatedEndAt: machine.estimatedEndAt,
    };
  }

  return {
    status: machine.status,
    remainingSeconds: machine.remainingSeconds ?? 0,
    progress: machine.progress,
    estimatedEndAt: machine.estimatedEndAt,
  };
}

export const STATUS_PRIORITY: Record<MachineStatus, number> = {
  AVAILABLE: 0,
  FINISHED: 1,
  RUNNING: 2,
  ERROR: 3,
};

interface StatusMeta {
  label: string;
  icon: LucideIcon;
  /** Lucide's Loader2 only reads as "in progress" once it's actually spinning. */
  spin: boolean;
  badgeClassName: string;
  iconClassName: string;
}

export function getStatusMeta(status: MachineStatus, type: MachineType): StatusMeta {
  switch (status) {
    case 'AVAILABLE':
      return {
        label: '사용 가능',
        icon: CheckCircle2,
        spin: false,
        badgeClassName: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
        iconClassName: 'text-emerald-500',
      };
    case 'RUNNING':
      return {
        label: type === 'WASHER' ? '세탁 중' : '건조 중',
        icon: Loader2,
        spin: true,
        badgeClassName: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
        iconClassName: 'text-sky-500',
      };
    case 'FINISHED':
      return {
        label: '사용 완료',
        icon: PackageCheck,
        spin: false,
        badgeClassName: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
        iconClassName: 'text-amber-500',
      };
    case 'ERROR':
      return {
        label: '점검 필요',
        icon: AlertTriangle,
        spin: false,
        badgeClassName: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
        iconClassName: 'text-rose-500',
      };
  }
}

export function getMachineTypeLabel(type: MachineType): string {
  return type === 'WASHER' ? '세탁기' : '건조기';
}

export function getMachineTypeIcon(type: MachineType): LucideIcon {
  return type === 'WASHER' ? WashingMachine : Wind;
}

export interface LiveMachine {
  machine: Machine;
  live: LiveMachineState;
}

export function filterLiveMachinesByStatus(items: LiveMachine[], filter: MachineStatusFilter): LiveMachine[] {
  if (filter === 'ALL') return items;
  if (filter === 'AVAILABLE') return items.filter((item) => item.live.status === 'AVAILABLE');
  return items.filter((item) => item.live.status === 'RUNNING');
}

export function sortLiveMachines(items: LiveMachine[], sortOption: MachineSortOption): LiveMachine[] {
  const sorted = [...items];

  switch (sortOption) {
    case 'AVAILABLE_FIRST':
      sorted.sort(
        (a, b) =>
          STATUS_PRIORITY[a.live.status] - STATUS_PRIORITY[b.live.status] ||
          a.machine.machineNumber - b.machine.machineNumber,
      );
      break;
    case 'REMAINING_ASC':
      sorted.sort((a, b) => {
        const aRunning = a.live.status === 'RUNNING';
        const bRunning = b.live.status === 'RUNNING';
        if (aRunning && bRunning) return a.live.remainingSeconds - b.live.remainingSeconds;
        if (aRunning) return -1;
        if (bRunning) return 1;
        return a.machine.machineNumber - b.machine.machineNumber;
      });
      break;
    case 'NUMBER':
    default:
      sorted.sort((a, b) => a.machine.machineNumber - b.machine.machineNumber);
      break;
  }

  return sorted;
}
