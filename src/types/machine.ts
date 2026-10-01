export type MachineType = 'WASHER' | 'DRYER';

export type MachineStatus = 'AVAILABLE' | 'RUNNING' | 'FINISHED' | 'ERROR';

/**
 * Shape delivered by the IoT server for a single washer/dryer.
 * Mirrors the sensor payload so swapping the mock API for the real
 * IoT backend later requires no changes on the frontend.
 */
export interface Machine {
  id: string;
  storeId: string;
  machineNumber: number;
  type: MachineType;
  status: MachineStatus;
  startedAt: string | null;
  estimatedEndAt: string | null;
  totalDuration: number | null;
  remainingSeconds: number | null;
  progress: number;
  updatedAt: string;
}

export interface MachineListResponse {
  machines: Machine[];
}

export interface MachineDetailResponse {
  machine: Machine;
}
