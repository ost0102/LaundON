import { prisma } from '@/lib/db/prisma';
import type { MachineModel as DbMachine } from '@/generated/prisma/models';
import type { Machine, MachineStatus, MachineType } from '@/types/machine';
import type { Store, StoreSummary } from '@/types/store';

import {
  MachineNotAvailableError,
  MachineNotFoundError,
  MachineNotRunningError,
  ProgramNotFoundError,
  type IotService,
} from './types';

type MachineRow = DbMachine & { program: { name: string } | null };

function toMachineDto(row: MachineRow, now: number): Machine {
  const estimatedEndMs = row.estimatedEndAt ? row.estimatedEndAt.getTime() : null;

  if (row.status === 'RUNNING' && estimatedEndMs !== null && row.startedAt) {
    const remainingSeconds = Math.max(0, Math.floor((estimatedEndMs - now) / 1000));
    const totalDuration = row.totalSeconds ?? remainingSeconds;
    const elapsed = totalDuration - remainingSeconds;
    const progress =
      totalDuration > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100))) : 100;

    return {
      id: row.id,
      storeId: row.laundromatId,
      machineNumber: row.machineNumber,
      type: row.type as MachineType,
      status: 'RUNNING',
      program: row.program?.name ?? null,
      price: row.price,
      startedAt: row.startedAt.toISOString(),
      estimatedEndAt: row.estimatedEndAt!.toISOString(),
      totalDuration: row.totalSeconds,
      remainingSeconds,
      progress,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  const status = row.status as MachineStatus;
  return {
    id: row.id,
    storeId: row.laundromatId,
    machineNumber: row.machineNumber,
    type: row.type as MachineType,
    status,
    program: null,
    price: row.price,
    startedAt: null,
    estimatedEndAt: null,
    totalDuration: row.totalSeconds,
    remainingSeconds: status === 'COMPLETED' ? 0 : null,
    progress: status === 'COMPLETED' ? 100 : 0,
    updatedAt: row.updatedAt.toISOString(),
  };
}

const MACHINE_INCLUDE = { program: { select: { name: true } } } as const;

function machineOrderBy() {
  return [{ type: 'asc' as const }, { machineNumber: 'asc' as const }];
}

export class PrismaIotService implements IotService {
  async listLaundromats(): Promise<StoreSummary[]> {
    const rows = await prisma.laundromat.findMany({
      include: { machines: { select: { type: true, status: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return rows.map((row) => {
      const washers = row.machines.filter((machine) => machine.type === 'WASHER');
      const dryers = row.machines.filter((machine) => machine.type === 'DRYER');

      return {
        id: row.id,
        name: row.name,
        address: row.address,
        washerAvailableCount: washers.filter((machine) => machine.status === 'AVAILABLE').length,
        washerTotalCount: washers.length,
        dryerAvailableCount: dryers.filter((machine) => machine.status === 'AVAILABLE').length,
        dryerTotalCount: dryers.length,
      };
    });
  }

  async getLaundromat(id: string): Promise<Store | null> {
    const row = await prisma.laundromat.findUnique({ where: { id } });
    if (!row) return null;
    return { id: row.id, name: row.name, address: row.address };
  }

  async listMachines(laundromatId: string): Promise<Machine[]> {
    const now = Date.now();
    const rows = await prisma.machine.findMany({
      where: { laundromatId },
      include: MACHINE_INCLUDE,
      orderBy: machineOrderBy(),
    });
    return rows.map((row) => toMachineDto(row, now));
  }

  async getMachine(id: string): Promise<Machine | null> {
    const row = await prisma.machine.findUnique({ where: { id }, include: MACHINE_INCLUDE });
    if (!row) return null;
    return toMachineDto(row, Date.now());
  }

  async getAvailableMachines(laundromatId?: string): Promise<Machine[]> {
    const now = Date.now();
    const rows = await prisma.machine.findMany({
      where: { status: 'AVAILABLE', ...(laundromatId ? { laundromatId } : {}) },
      include: MACHINE_INCLUDE,
      orderBy: machineOrderBy(),
    });
    return rows.map((row) => toMachineDto(row, now));
  }

  async startMachine(id: string, programId?: string): Promise<Machine> {
    const machine = await prisma.machine.findUnique({ where: { id } });
    if (!machine) throw new MachineNotFoundError(id);
    if (machine.status !== 'AVAILABLE') throw new MachineNotAvailableError(id);

    const program = programId
      ? await prisma.laundryProgram.findFirst({
          where: { id: programId, laundromatId: machine.laundromatId, machineType: machine.type },
        })
      : await prisma.laundryProgram.findFirst({
          where: { laundromatId: machine.laundromatId, machineType: machine.type },
          orderBy: { price: 'asc' },
        });

    if (!program) throw new ProgramNotFoundError(programId ?? `${machine.laundromatId}:${machine.type}`);

    const startedAt = new Date();
    const totalSeconds = program.durationMinutes * 60;
    const estimatedEndAt = new Date(startedAt.getTime() + totalSeconds * 1000);

    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.machine.update({
        where: { id },
        data: {
          status: 'RUNNING',
          programId: program.id,
          price: program.price,
          startedAt,
          estimatedEndAt,
          totalSeconds,
        },
        include: MACHINE_INCLUDE,
      });
      await tx.machineStatusHistory.create({
        data: { machineId: id, status: 'RUNNING', note: `started with program ${program.name}` },
      });
      return row;
    });

    return toMachineDto(updated, Date.now());
  }

  async stopMachine(id: string): Promise<Machine> {
    const machine = await prisma.machine.findUnique({ where: { id } });
    if (!machine) throw new MachineNotFoundError(id);
    if (machine.status !== 'RUNNING') throw new MachineNotRunningError(id);

    // Reset to the cheapest program's price - otherwise an AVAILABLE machine
    // would keep displaying whatever price its last (possibly pricier) run
    // charged, instead of its actual starting price.
    const defaultProgram = await prisma.laundryProgram.findFirst({
      where: { laundromatId: machine.laundromatId, machineType: machine.type },
      orderBy: { price: 'asc' },
    });

    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.machine.update({
        where: { id },
        data: {
          status: 'AVAILABLE',
          programId: null,
          startedAt: null,
          estimatedEndAt: null,
          totalSeconds: null,
          price: defaultProgram?.price ?? machine.price,
        },
        include: MACHINE_INCLUDE,
      });
      await tx.machineStatusHistory.create({
        data: { machineId: id, status: 'AVAILABLE', note: 'stopped' },
      });
      return row;
    });

    return toMachineDto(updated, Date.now());
  }
}
