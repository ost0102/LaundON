import { z } from 'zod';

import { iotService } from '@/lib/services/iot';
import type { Machine } from '@/types/machine';

import { toolError, type AiTool, type ToolContext } from './types';

function toMinutes(seconds: number | null): number | null {
  if (seconds === null) return null;
  return Math.ceil(seconds / 60);
}

function machineSummary(machine: Machine) {
  return {
    machineId: machine.id,
    laundromatId: machine.storeId,
    machineNumber: machine.machineNumber,
    type: machine.type,
    status: machine.status,
    program: machine.program,
    price: machine.price,
    remainingMinutes: toMinutes(machine.remainingSeconds),
  };
}

const getMachineStatusSchema = z.object({ machineId: z.string() });

export const getMachineStatusTool: AiTool = {
  definition: {
    name: 'get_machine_status',
    description: '특정 기기(세탁기/건조기)의 현재 상태, 코스, 남은 시간을 조회합니다.',
    parameters: {
      type: 'object',
      properties: { machineId: { type: 'string', description: '기기 ID' } },
      required: ['machineId'],
    },
  },
  async execute(argsJson) {
    const parsed = getMachineStatusSchema.safeParse(JSON.parse(argsJson));
    if (!parsed.success) return toolError('machineId가 필요합니다.');

    const machine = await iotService.getMachine(parsed.data.machineId);
    if (!machine) return toolError('해당 기기를 찾을 수 없습니다.');
    return machineSummary(machine);
  },
};

const getAvailableMachinesSchema = z.object({
  laundromatId: z.string().optional(),
  type: z.enum(['WASHER', 'DRYER']).optional(),
});

export const getAvailableMachinesTool: AiTool = {
  definition: {
    name: 'get_available_machines',
    description: '지금 바로 사용할 수 있는(AVAILABLE) 세탁기/건조기 목록을 조회합니다.',
    parameters: {
      type: 'object',
      properties: {
        laundromatId: { type: 'string', description: '세탁소 ID (생략하면 현재 대화의 세탁소 또는 전체)' },
        type: { type: 'string', enum: ['WASHER', 'DRYER'], description: '기기 종류 필터 (선택)' },
      },
    },
  },
  async execute(argsJson, context: ToolContext) {
    const parsed = getAvailableMachinesSchema.safeParse(JSON.parse(argsJson));
    if (!parsed.success) return toolError('요청 형식이 올바르지 않습니다.');

    // Context wins over the model's guess - see get_laundromat_status for why.
    const laundromatId = context.laundromatId ?? parsed.data.laundromatId;
    const machines = await iotService.getAvailableMachines(laundromatId);
    const filtered = parsed.data.type ? machines.filter((m) => m.type === parsed.data.type) : machines;
    return { count: filtered.length, machines: filtered.map(machineSummary) };
  },
};

const getMachineRemainingTimeSchema = z.object({ machineId: z.string() });

export const getMachineRemainingTimeTool: AiTool = {
  definition: {
    name: 'get_machine_remaining_time',
    description: '특정 기기가 끝나기까지 남은 시간(분)을 조회합니다. 사용 가능한 기기는 0분을 반환합니다.',
    parameters: {
      type: 'object',
      properties: { machineId: { type: 'string', description: '기기 ID' } },
      required: ['machineId'],
    },
  },
  async execute(argsJson) {
    const parsed = getMachineRemainingTimeSchema.safeParse(JSON.parse(argsJson));
    if (!parsed.success) return toolError('machineId가 필요합니다.');

    const machine = await iotService.getMachine(parsed.data.machineId);
    if (!machine) return toolError('해당 기기를 찾을 수 없습니다.');
    return { machineId: machine.id, status: machine.status, remainingMinutes: toMinutes(machine.remainingSeconds) };
  },
};

const getLaundromatStatusSchema = z.object({ laundromatId: z.string().optional() });

export const getLaundromatStatusTool: AiTool = {
  definition: {
    name: 'get_laundromat_status',
    description:
      '특정 세탁소의 운영 상태, 세탁기/건조기 요약 대수, 그리고 기기 번호별 상세 상태 목록(machineId 포함)을 조회합니다. "N번 세탁기/건조기"처럼 번호로 질문받았을 때는 이 Tool로 먼저 목록을 조회해 machineId를 알아낸 뒤 다른 Tool에 사용하세요. laundromatId는 정확한 ID를 모르면 생략하세요 - 현재 대화의 세탁소가 자동으로 사용됩니다.',
    parameters: {
      type: 'object',
      properties: { laundromatId: { type: 'string', description: '세탁소 ID (모르면 생략)' } },
    },
  },
  async execute(argsJson, context: ToolContext) {
    const parsed = getLaundromatStatusSchema.safeParse(JSON.parse(argsJson));
    // Context (the laundromat the chat session is actually scoped to) always
    // wins over whatever the model supplies - it has no reliable way to know
    // the real laundromatId and tends to pass the display name instead.
    const laundromatId = context.laundromatId ?? (parsed.success ? parsed.data.laundromatId : undefined);
    if (!laundromatId) return toolError('laundromatId가 필요합니다.');

    const laundromat = await iotService.getLaundromat(laundromatId);
    if (!laundromat) return toolError('해당 세탁소를 찾을 수 없습니다.');

    const machines = await iotService.listMachines(laundromatId);
    const washers = machines.filter((m) => m.type === 'WASHER');
    const dryers = machines.filter((m) => m.type === 'DRYER');

    return {
      laundromatId: laundromat.id,
      name: laundromat.name,
      address: laundromat.address,
      washerAvailable: washers.filter((m) => m.status === 'AVAILABLE').length,
      washerTotal: washers.length,
      dryerAvailable: dryers.filter((m) => m.status === 'AVAILABLE').length,
      dryerTotal: dryers.length,
      machines: machines.map(machineSummary),
    };
  },
};

const getMachineProgramSchema = z.object({ machineId: z.string() });

export const getMachineProgramTool: AiTool = {
  definition: {
    name: 'get_machine_program',
    description: '특정 기기에 설정된 세탁 코스, 그리고 같은 종류 기기에서 선택 가능한 코스 목록(이름/소요시간/가격)을 조회합니다.',
    parameters: {
      type: 'object',
      properties: { machineId: { type: 'string', description: '기기 ID' } },
      required: ['machineId'],
    },
  },
  async execute(argsJson) {
    const parsed = getMachineProgramSchema.safeParse(JSON.parse(argsJson));
    if (!parsed.success) return toolError('machineId가 필요합니다.');

    const machine = await iotService.getMachine(parsed.data.machineId);
    if (!machine) return toolError('해당 기기를 찾을 수 없습니다.');

    return {
      machineId: machine.id,
      currentProgram: machine.program,
      currentPrice: machine.price,
    };
  },
};

export const realtimeTools: AiTool[] = [
  getMachineStatusTool,
  getAvailableMachinesTool,
  getMachineRemainingTimeTool,
  getLaundromatStatusTool,
  getMachineProgramTool,
];
