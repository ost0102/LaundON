import type { Machine } from '@/types/machine';
import type { Store, StoreSummary } from '@/types/store';

/**
 * Everything the app needs from "the laundromat/machine backend", kept
 * behind one interface so a real IoT gateway can implement it later without
 * touching API routes, AI tools, or the frontend. See docs/architecture.md.
 */
export interface IotService {
  listLaundromats(): Promise<StoreSummary[]>;
  getLaundromat(id: string): Promise<Store | null>;
  listMachines(laundromatId: string): Promise<Machine[]>;
  getMachine(id: string): Promise<Machine | null>;
  getAvailableMachines(laundromatId?: string): Promise<Machine[]>;
  startMachine(id: string, programId?: string): Promise<Machine>;
  stopMachine(id: string): Promise<Machine>;
}

export class MachineNotFoundError extends Error {
  constructor(machineId: string) {
    super(`기기를 찾을 수 없습니다: ${machineId}`);
    this.name = 'MachineNotFoundError';
  }
}

export class MachineNotAvailableError extends Error {
  constructor(machineId: string) {
    super(`사용할 수 없는 상태의 기기입니다: ${machineId}`);
    this.name = 'MachineNotAvailableError';
  }
}

export class MachineNotRunningError extends Error {
  constructor(machineId: string) {
    super(`실행 중이 아닌 기기입니다: ${machineId}`);
    this.name = 'MachineNotRunningError';
  }
}

export class ProgramNotFoundError extends Error {
  constructor(programId: string) {
    super(`세탁 코스를 찾을 수 없습니다: ${programId}`);
    this.name = 'ProgramNotFoundError';
  }
}
