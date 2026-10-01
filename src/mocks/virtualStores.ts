import { destinationPoint, haversineDistanceMeters, type Coordinates } from '@/lib/geo';
import { createSeededRandom, pickWeighted } from '@/lib/random';
import { buildMachineRuntime, toLiveMachine, type MachineRuntime, type MachineSeed } from '@/mocks/machines';
import type { Machine, MachineStatus, MachineType } from '@/types/machine';
import type { Store, StoreSummary } from '@/types/store';

export const VIRTUAL_STORE_PREFIX = 'geo-';

const GEO_CELL_DECIMALS = 3; // ~111m grid - keeps the list stable for small GPS jitter
const STORES_PER_CELL = 5;

const NAME_PREFIXES = [
  '우리동네',
  '역앞',
  '24시',
  '스마트',
  '클린',
  '프레시',
  '산뜻한',
  '해피',
  '빠른',
  '편한',
];
const NAME_SUFFIXES = ['코인세탁소', '빨래방', '코인런드리', '셀프빨래방'];

function roundCoord(value: number): string {
  return value.toFixed(GEO_CELL_DECIMALS);
}

function buildCellId(coords: Coordinates): string {
  return `${roundCoord(coords.lat)}_${roundCoord(coords.lng)}`;
}

/** Deterministic machine mix so the same virtual store always generates the same lineup. */
function generateMachineSeedsForStore(storeId: string): MachineSeed[] {
  const rand = createSeededRandom(`machines:${storeId}`);
  const washerCount = 3 + Math.floor(rand() * 3); // 3-5
  const dryerCount = 2 + Math.floor(rand() * 3); // 2-4

  const STATUS_OPTIONS: { value: MachineStatus; weight: number }[] = [
    { value: 'AVAILABLE', weight: 0.4 },
    { value: 'RUNNING', weight: 0.45 },
    { value: 'FINISHED', weight: 0.08 },
    { value: 'ERROR', weight: 0.07 },
  ];

  function buildOne(type: MachineType, machineNumber: number): MachineSeed {
    const status = pickWeighted(rand, STATUS_OPTIONS);
    const totalDurationBase = type === 'WASHER' ? 35 * 60 : 40 * 60;
    const totalDuration = status === 'RUNNING' || status === 'FINISHED' ? totalDurationBase : null;
    const elapsedSecondsAtBoot = status === 'RUNNING' ? Math.floor(rand() * (totalDurationBase - 60)) : 0;
    const suffix = String(machineNumber).padStart(2, '0');

    return {
      id: `${storeId}__${type.toLowerCase()}-${suffix}`,
      storeId,
      machineNumber,
      type,
      status,
      elapsedSecondsAtBoot,
      totalDuration,
    };
  }

  const seeds: MachineSeed[] = [];
  for (let i = 1; i <= washerCount; i++) seeds.push(buildOne('WASHER', i));
  for (let i = 1; i <= dryerCount; i++) seeds.push(buildOne('DRYER', i));
  return seeds;
}

function generateStoreName(rand: () => number, used: Set<string>): string {
  let name = '';
  let attempts = 0;
  do {
    const prefix = NAME_PREFIXES[Math.floor(rand() * NAME_PREFIXES.length)];
    const suffix = NAME_SUFFIXES[Math.floor(rand() * NAME_SUFFIXES.length)];
    name = `${prefix} ${suffix}`;
    attempts += 1;
  } while (used.has(name) && attempts < 20);

  used.add(name);
  return name;
}

interface VirtualStoreRuntime {
  store: Store;
  coords: Coordinates;
  machines: MachineRuntime[];
}

declare global {
  // eslint-disable-next-line no-var
  var __laundryNowVirtualStores: Map<string, VirtualStoreRuntime> | undefined;
}

// Same reasoning as mocks/machines.ts's RUNTIME: each route bundle would
// otherwise regenerate (and re-time) a virtual store independently, so a
// machine's countdown would never advance. One shared, lazily-populated
// cache keeps a given store's machines ticking consistently across requests.
const virtualStores: Map<string, VirtualStoreRuntime> = (globalThis.__laundryNowVirtualStores ??= new Map());

function getOrCreateVirtualStore(id: string, name: string, coords: Coordinates): VirtualStoreRuntime {
  const existing = virtualStores.get(id);
  if (existing) return existing;

  const bootTime = Date.now();
  const machines = generateMachineSeedsForStore(id).map((seed) => buildMachineRuntime(seed, bootTime));
  const runtime: VirtualStoreRuntime = {
    store: { id, name, address: '내 위치 주변' },
    coords,
    machines,
  };

  virtualStores.set(id, runtime);
  return runtime;
}

/**
 * Replays the deterministic per-cell generation loop up to `uptoIndex`
 * (inclusive) and returns that store's id/name/coords. Used both to build
 * the full nearby list and, for a cold cache (e.g. a direct link after a
 * server restart), to regenerate a single store without the others.
 */
function generateCellStoreAt(
  origin: Coordinates,
  cellId: string,
  uptoIndex: number,
): { id: string; name: string; coords: Coordinates } {
  const rand = createSeededRandom(`store-list:${cellId}`);
  const usedNames = new Set<string>();

  let result: { id: string; name: string; coords: Coordinates } | null = null;

  for (let i = 0; i <= uptoIndex; i++) {
    const distanceMeters = 80 + rand() * 820; // 80m ~ 900m away
    const bearingDeg = rand() * 360;
    const coords = destinationPoint(origin, distanceMeters, bearingDeg);
    const name = generateStoreName(rand, usedNames);
    result = { id: `${VIRTUAL_STORE_PREFIX}${cellId}-${i}`, name, coords };
  }

  // uptoIndex is always >= 0, so the loop runs at least once.
  return result!;
}

/** Parses "geo-{lat}_{lng}-{index}" back into its cell id, origin, and index. */
function parseVirtualStoreId(storeId: string): { cellId: string; origin: Coordinates; index: number } | null {
  const withoutPrefix = storeId.slice(VIRTUAL_STORE_PREFIX.length);
  const match = /^(-?\d+\.\d+)_(-?\d+\.\d+)-(\d+)$/.exec(withoutPrefix);
  if (!match) return null;

  const [, latStr, lngStr, indexStr] = match;
  return {
    cellId: `${latStr}_${lngStr}`,
    origin: { lat: Number(latStr), lng: Number(lngStr) },
    index: Number(indexStr),
  };
}

function toSummary(runtime: VirtualStoreRuntime, origin: Coordinates): StoreSummary {
  const now = Date.now();
  const machines = runtime.machines.map((machine) => toLiveMachine(machine, now));
  const washers = machines.filter((machine) => machine.type === 'WASHER');
  const dryers = machines.filter((machine) => machine.type === 'DRYER');

  return {
    ...runtime.store,
    washerAvailableCount: washers.filter((machine) => machine.status === 'AVAILABLE').length,
    washerTotalCount: washers.length,
    dryerAvailableCount: dryers.filter((machine) => machine.status === 'AVAILABLE').length,
    dryerTotalCount: dryers.length,
    distanceMeters: Math.round(haversineDistanceMeters(origin, runtime.coords)),
  };
}

/** Generates (or reuses) a stable set of nearby stores for a given coordinate. */
export function generateNearbyStores(origin: Coordinates): StoreSummary[] {
  const cellId = buildCellId(origin);

  const summaries = Array.from({ length: STORES_PER_CELL }, (_, i) => {
    const { id, name, coords } = generateCellStoreAt(origin, cellId, i);
    const runtime = getOrCreateVirtualStore(id, name, coords);
    return toSummary(runtime, origin);
  });

  return summaries.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
}

export function isVirtualStoreId(storeId: string): boolean {
  return storeId.startsWith(VIRTUAL_STORE_PREFIX);
}

/** Looks up a virtual store, regenerating it from its id if the cache was cold. */
function resolveVirtualStore(storeId: string): VirtualStoreRuntime | undefined {
  const cached = virtualStores.get(storeId);
  if (cached) return cached;

  const parsed = parseVirtualStoreId(storeId);
  if (!parsed) return undefined;

  const { id, name, coords } = generateCellStoreAt(parsed.origin, parsed.cellId, parsed.index);
  return getOrCreateVirtualStore(id, name, coords);
}

export function findVirtualStore(storeId: string): Store | undefined {
  return resolveVirtualStore(storeId)?.store;
}

export function getVirtualStoreMachines(storeId: string): Machine[] | undefined {
  const runtime = resolveVirtualStore(storeId);
  if (!runtime) return undefined;

  const now = Date.now();
  return runtime.machines
    .map((machine) => toLiveMachine(machine, now))
    .sort((a, b) => a.type.localeCompare(b.type) || a.machineNumber - b.machineNumber);
}

export function getVirtualMachineById(machineId: string): Machine | undefined {
  const [storeId] = machineId.split('__');
  if (!storeId) return undefined;

  const runtime = resolveVirtualStore(storeId);
  const match = runtime?.machines.find((machine) => machine.seed.id === machineId);
  if (!match) return undefined;

  return toLiveMachine(match, Date.now());
}
