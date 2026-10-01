import type { Machine, MachineStatus, MachineType } from '@/types/machine';

/**
 * Seed definition for one machine. For RUNNING machines we record how many
 * seconds had already elapsed "at boot" (when this module first loaded),
 * so that every subsequent request can derive startedAt/estimatedEndAt once
 * and simply recompute the live countdown from the wall clock - the same
 * way a real IoT server would report an ever-decreasing remainingSeconds.
 */
export interface MachineSeed {
  id: string;
  storeId: string;
  machineNumber: number;
  type: MachineType;
  status: MachineStatus;
  elapsedSecondsAtBoot: number;
  totalDuration: number | null;
}

const SEEDS: MachineSeed[] = [
  // store-001: 우리동네 코인세탁소
  {
    id: 'store-001-washer-01',
    storeId: 'store-001',
    machineNumber: 1,
    type: 'WASHER',
    status: 'AVAILABLE',
    elapsedSecondsAtBoot: 0,
    totalDuration: null,
  },
  {
    id: 'store-001-washer-02',
    storeId: 'store-001',
    machineNumber: 2,
    type: 'WASHER',
    status: 'RUNNING',
    elapsedSecondsAtBoot: 17 * 60,
    totalDuration: 35 * 60,
  },
  {
    id: 'store-001-washer-03',
    storeId: 'store-001',
    machineNumber: 3,
    type: 'WASHER',
    status: 'RUNNING',
    elapsedSecondsAtBoot: 3 * 60,
    totalDuration: 35 * 60,
  },
  {
    id: 'store-001-washer-04',
    storeId: 'store-001',
    machineNumber: 4,
    type: 'WASHER',
    status: 'AVAILABLE',
    elapsedSecondsAtBoot: 0,
    totalDuration: null,
  },
  {
    id: 'store-001-washer-05',
    storeId: 'store-001',
    machineNumber: 5,
    type: 'WASHER',
    status: 'FINISHED',
    elapsedSecondsAtBoot: 0,
    totalDuration: 35 * 60,
  },

  {
    id: 'store-001-dryer-01',
    storeId: 'store-001',
    machineNumber: 1,
    type: 'DRYER',
    status: 'RUNNING',
    elapsedSecondsAtBoot: 28 * 60,
    totalDuration: 40 * 60,
  },
  {
    id: 'store-001-dryer-02',
    storeId: 'store-001',
    machineNumber: 2,
    type: 'DRYER',
    status: 'AVAILABLE',
    elapsedSecondsAtBoot: 0,
    totalDuration: null,
  },
  {
    id: 'store-001-dryer-03',
    storeId: 'store-001',
    machineNumber: 3,
    type: 'DRYER',
    status: 'RUNNING',
    elapsedSecondsAtBoot: 15 * 60,
    totalDuration: 40 * 60,
  },
  {
    id: 'store-001-dryer-04',
    storeId: 'store-001',
    machineNumber: 4,
    type: 'DRYER',
    status: 'ERROR',
    elapsedSecondsAtBoot: 0,
    totalDuration: null,
  },

  // store-002: 학교앞 빨래방
  {
    id: 'store-002-washer-01',
    storeId: 'store-002',
    machineNumber: 1,
    type: 'WASHER',
    status: 'RUNNING',
    elapsedSecondsAtBoot: 5 * 60,
    totalDuration: 30 * 60,
  },
  {
    id: 'store-002-washer-02',
    storeId: 'store-002',
    machineNumber: 2,
    type: 'WASHER',
    status: 'AVAILABLE',
    elapsedSecondsAtBoot: 0,
    totalDuration: null,
  },
  {
    id: 'store-002-washer-03',
    storeId: 'store-002',
    machineNumber: 3,
    type: 'WASHER',
    status: 'ERROR',
    elapsedSecondsAtBoot: 0,
    totalDuration: null,
  },

  {
    id: 'store-002-dryer-01',
    storeId: 'store-002',
    machineNumber: 1,
    type: 'DRYER',
    status: 'AVAILABLE',
    elapsedSecondsAtBoot: 0,
    totalDuration: null,
  },
  {
    id: 'store-002-dryer-02',
    storeId: 'store-002',
    machineNumber: 2,
    type: 'DRYER',
    status: 'RUNNING',
    elapsedSecondsAtBoot: 32 * 60,
    totalDuration: 40 * 60,
  },

  // store-003: 자양동 코인런드리
  {
    id: 'store-003-washer-01',
    storeId: 'store-003',
    machineNumber: 1,
    type: 'WASHER',
    status: 'AVAILABLE',
    elapsedSecondsAtBoot: 0,
    totalDuration: null,
  },
  {
    id: 'store-003-washer-02',
    storeId: 'store-003',
    machineNumber: 2,
    type: 'WASHER',
    status: 'RUNNING',
    elapsedSecondsAtBoot: 9 * 60,
    totalDuration: 35 * 60,
  },
  {
    id: 'store-003-washer-03',
    storeId: 'store-003',
    machineNumber: 3,
    type: 'WASHER',
    status: 'AVAILABLE',
    elapsedSecondsAtBoot: 0,
    totalDuration: null,
  },
  {
    id: 'store-003-washer-04',
    storeId: 'store-003',
    machineNumber: 4,
    type: 'WASHER',
    status: 'RUNNING',
    elapsedSecondsAtBoot: 30 * 60,
    totalDuration: 35 * 60,
  },
  {
    id: 'store-003-dryer-01',
    storeId: 'store-003',
    machineNumber: 1,
    type: 'DRYER',
    status: 'AVAILABLE',
    elapsedSecondsAtBoot: 0,
    totalDuration: null,
  },
  {
    id: 'store-003-dryer-02',
    storeId: 'store-003',
    machineNumber: 2,
    type: 'DRYER',
    status: 'RUNNING',
    elapsedSecondsAtBoot: 20 * 60,
    totalDuration: 40 * 60,
  },
  {
    id: 'store-003-dryer-03',
    storeId: 'store-003',
    machineNumber: 3,
    type: 'DRYER',
    status: 'ERROR',
    elapsedSecondsAtBoot: 0,
    totalDuration: null,
  },

  // store-004: 강변역 빨래방
  {
    id: 'store-004-washer-01',
    storeId: 'store-004',
    machineNumber: 1,
    type: 'WASHER',
    status: 'RUNNING',
    elapsedSecondsAtBoot: 2 * 60,
    totalDuration: 30 * 60,
  },
  {
    id: 'store-004-washer-02',
    storeId: 'store-004',
    machineNumber: 2,
    type: 'WASHER',
    status: 'AVAILABLE',
    elapsedSecondsAtBoot: 0,
    totalDuration: null,
  },
  {
    id: 'store-004-washer-03',
    storeId: 'store-004',
    machineNumber: 3,
    type: 'WASHER',
    status: 'FINISHED',
    elapsedSecondsAtBoot: 0,
    totalDuration: 30 * 60,
  },
  {
    id: 'store-004-dryer-01',
    storeId: 'store-004',
    machineNumber: 1,
    type: 'DRYER',
    status: 'AVAILABLE',
    elapsedSecondsAtBoot: 0,
    totalDuration: null,
  },
  {
    id: 'store-004-dryer-02',
    storeId: 'store-004',
    machineNumber: 2,
    type: 'DRYER',
    status: 'RUNNING',
    elapsedSecondsAtBoot: 11 * 60,
    totalDuration: 40 * 60,
  },

  // store-005: 뚝섬유원지 세탁소
  {
    id: 'store-005-washer-01',
    storeId: 'store-005',
    machineNumber: 1,
    type: 'WASHER',
    status: 'AVAILABLE',
    elapsedSecondsAtBoot: 0,
    totalDuration: null,
  },
  {
    id: 'store-005-washer-02',
    storeId: 'store-005',
    machineNumber: 2,
    type: 'WASHER',
    status: 'AVAILABLE',
    elapsedSecondsAtBoot: 0,
    totalDuration: null,
  },
  {
    id: 'store-005-washer-03',
    storeId: 'store-005',
    machineNumber: 3,
    type: 'WASHER',
    status: 'RUNNING',
    elapsedSecondsAtBoot: 24 * 60,
    totalDuration: 35 * 60,
  },
  {
    id: 'store-005-dryer-01',
    storeId: 'store-005',
    machineNumber: 1,
    type: 'DRYER',
    status: 'RUNNING',
    elapsedSecondsAtBoot: 5 * 60,
    totalDuration: 40 * 60,
  },
  {
    id: 'store-005-dryer-02',
    storeId: 'store-005',
    machineNumber: 2,
    type: 'DRYER',
    status: 'AVAILABLE',
    elapsedSecondsAtBoot: 0,
    totalDuration: null,
  },
  {
    id: 'store-005-dryer-03',
    storeId: 'store-005',
    machineNumber: 3,
    type: 'DRYER',
    status: 'RUNNING',
    elapsedSecondsAtBoot: 35 * 60,
    totalDuration: 40 * 60,
  },
];

export interface MachineRuntime {
  seed: MachineSeed;
  startedAt: number | null;
  estimatedEndAt: number | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __laundryNowMachineRuntime: MachineRuntime[] | undefined;
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

// Next.js bundles each route handler separately, so a plain module-level
// "boot time" would be computed once per route bundle (whenever that route
// first loads) instead of once for the whole server - the same machine
// would then show a different countdown depending on which endpoint served
// it. Stashing the seeded runtime on globalThis keeps one shared instance.
function seedRuntime(): MachineRuntime[] {
  const bootTime = Date.now();
  return SEEDS.map((seed) => buildMachineRuntime(seed, bootTime));
}

const RUNTIME: MachineRuntime[] = (globalThis.__laundryNowMachineRuntime ??= seedRuntime());

/**
 * Computes the "live" machine payload as if it just arrived fresh from the
 * IoT server. RUNNING machines keep reporting status RUNNING even after
 * their countdown reaches zero (remainingSeconds clamps at 0) - a real
 * sensor confirmation (FINISHED) can lag behind the clock, so the frontend
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
      startedAt: null,
      estimatedEndAt: null,
      totalDuration: seed.totalDuration,
      remainingSeconds: seed.status === 'FINISHED' ? 0 : null,
      progress: seed.status === 'FINISHED' ? 100 : 0,
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
    startedAt: new Date(startedAt).toISOString(),
    estimatedEndAt: new Date(estimatedEndAt).toISOString(),
    totalDuration: seed.totalDuration,
    remainingSeconds,
    progress,
    updatedAt: new Date(now).toISOString(),
  };
}

export function getMockMachinesByStore(storeId: string): Machine[] {
  const now = Date.now();
  return RUNTIME.filter((runtime) => runtime.seed.storeId === storeId)
    .map((runtime) => toLiveMachine(runtime, now))
    .sort((a, b) => a.type.localeCompare(b.type) || a.machineNumber - b.machineNumber);
}

export function getMockMachineById(machineId: string): Machine | undefined {
  const runtime = RUNTIME.find((item) => item.seed.id === machineId);
  if (!runtime) return undefined;
  return toLiveMachine(runtime, Date.now());
}

export function getAllMockMachines(): Machine[] {
  const now = Date.now();
  return RUNTIME.map((runtime) => toLiveMachine(runtime, now));
}
