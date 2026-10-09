import type { Machine, MachineStatus, MachineType } from '@/types/machine';

/**
 * Seed definition for one machine. For RUNNING machines we record how many
 * seconds had already elapsed "at boot" (when this module first loaded),
 * so that every subsequent request can derive startedAt/estimatedEndAt once
 * and simply recompute the live countdown from the wall clock - the same
 * way a real IoT server would report an ever-decreasing remainingSeconds.
 *
 * Used by the geo "virtual store" generator (src/mocks/virtualStores.ts).
 * Registered stores are DB-backed now - see lib/services/iot.
 */
export interface MachineSeed {
  id: string;
  storeId: string;
  machineNumber: number;
  type: MachineType;
  status: MachineStatus;
  program: string | null;
  price: number;
  elapsedSecondsAtBoot: number;
  totalDuration: number | null;
}

export interface MachineRuntime {
  seed: MachineSeed;
  startedAt: number | null;
  estimatedEndAt: number | null;
}

/** Converts one seed into a runtime record, fixing its startedAt to `bootTime`. */
export function buildMachineRuntime(seed: MachineSeed, bootTime: number): MachineRuntime {
  if (seed.status !== 'RUNNING' || seed.totalDuration === null) {
    return { seed, startedAt: null, estimatedEndAt: null };
  }

  const startedAt = bootTime - seed.elapsedSecondsAtBoot * 1000;
  const estimatedEndAt = startedAt + seed.totalDuration * 1000;
  return { seed, startedAt, estimatedEndAt };
}

/**
 * Computes the "live" machine payload as if it just arrived fresh from the
 * IoT server. RUNNING machines keep reporting status RUNNING even after
 * their countdown reaches zero (remainingSeconds clamps at 0) - a real
 * sensor confirmation (COMPLETED) can lag behind the clock, so the frontend
 * is responsible for predicting completion in the UI (see useLiveMachine).
 */
export function toLiveMachine(runtime: MachineRuntime, now: number): Machine {
  const { seed, startedAt, estimatedEndAt } = runtime;

  if (seed.status !== 'RUNNING' || startedAt === null || estimatedEndAt === null) {
    return {
      id: seed.id,
      storeId: seed.storeId,
      machineNumber: seed.machineNumber,
      type: seed.type,
      status: seed.status,
      program: null,
      price: seed.price,
      startedAt: null,
      estimatedEndAt: null,
      totalDuration: seed.totalDuration,
      remainingSeconds: seed.status === 'COMPLETED' ? 0 : null,
      progress: seed.status === 'COMPLETED' ? 100 : 0,
      updatedAt: new Date(now).toISOString(),
    };
  }

  const remainingSeconds = Math.max(0, Math.floor((estimatedEndAt - now) / 1000));
  const totalDuration = seed.totalDuration ?? 0;
  const elapsed = totalDuration - remainingSeconds;
  const progress =
    totalDuration > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100))) : 100;

  return {
    id: seed.id,
    storeId: seed.storeId,
    machineNumber: seed.machineNumber,
    type: seed.type,
    status: 'RUNNING',
    program: seed.program,
    price: seed.price,
    startedAt: new Date(startedAt).toISOString(),
    estimatedEndAt: new Date(estimatedEndAt).toISOString(),
    totalDuration: seed.totalDuration,
    remainingSeconds,
    progress,
    updatedAt: new Date(now).toISOString(),
  };
}
