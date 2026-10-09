import { prisma } from '@/lib/db/prisma';
import { iotService } from '@/lib/services/iot';

import type { LlmMessage, LlmRole, LlmToolCall } from './llmProvider';
import { getLlmProvider } from './index';
import { buildSystemPrompt } from './systemPrompt';
import { allTools, toolError } from './tools';

const MAX_TOOL_ITERATIONS = 4;
const MAX_HISTORY_MESSAGES = 20;

interface HandleChatInput {
  sessionId?: string;
  userId?: string;
  laundromatId?: string;
  message: string;
}

export interface HandleChatResult {
  sessionId: string;
  reply: string;
  referencedMachineIds: string[];
  referencedDocumentTitles: string[];
}

const toolsByName = new Map(allTools.map((tool) => [tool.definition.name, tool]));

interface DbChatMessageLike {
  role: string;
  content: string;
  toolCallId: string | null;
  toolName: string | null;
  toolCalls: unknown;
}

function dbMessageToLlm(message: DbChatMessageLike): LlmMessage {
  const role = message.role.toLowerCase() as LlmRole;

  if (role === 'tool') {
    return {
      role: 'tool',
      content: message.content,
      toolCallId: message.toolCallId ?? undefined,
      name: message.toolName ?? undefined,
    };
  }

  if (role === 'assistant' && message.toolCalls) {
    return { role: 'assistant', content: message.content, toolCalls: message.toolCalls as LlmToolCall[] };
  }

  return { role, content: message.content };
}

/** Best-effort, duck-typed scan of a tool's JSON output - just enough for the UI to offer "[2번 세탁기 보기]"-style shortcuts and citations. */
function collectReferences(toolName: string, output: unknown, machineIds: Set<string>, documentTitles: Set<string>) {
  if (!output || typeof output !== 'object') return;
  const obj = output as Record<string, unknown>;

  if (toolName === 'get_laundry_information' && Array.isArray(obj.documents)) {
    for (const doc of obj.documents) {
      if (doc && typeof doc === 'object' && typeof (doc as { title?: unknown }).title === 'string') {
        documentTitles.add((doc as { title: string }).title);
      }
    }
    return;
  }

  if (typeof obj.machineId === 'string') machineIds.add(obj.machineId);
  if (Array.isArray(obj.machines)) {
    for (const machine of obj.machines) {
      if (machine && typeof machine === 'object' && typeof (machine as { machineId?: unknown }).machineId === 'string') {
        machineIds.add((machine as { machineId: string }).machineId);
      }
    }
  }
}

export async function handleChatMessage(input: HandleChatInput): Promise<HandleChatResult> {
  const existingSession = input.sessionId
    ? await prisma.chatSession.findUnique({ where: { id: input.sessionId } })
    : null;

  const chatSession =
    existingSession ??
    (await prisma.chatSession.create({
      data: { userId: input.userId, laundromatId: input.laundromatId },
    }));

  const laundromatId = input.laundromatId ?? chatSession.laundromatId ?? undefined;
  const laundromat = laundromatId ? await iotService.getLaundromat(laundromatId) : null;

  await prisma.chatMessage.create({
    data: { sessionId: chatSession.id, role: 'USER', content: input.message },
  });

  const recentDesc = await prisma.chatMessage.findMany({
    where: { sessionId: chatSession.id },
    orderBy: { createdAt: 'desc' },
    take: MAX_HISTORY_MESSAGES,
  });
  const history = recentDesc.reverse();

  const systemPrompt = buildSystemPrompt({ laundromatName: laundromat?.name });
  const messages: LlmMessage[] = [{ role: 'system', content: systemPrompt }, ...history.map(dbMessageToLlm)];
  const toolDefs = allTools.map((tool) => tool.definition);

  const llmProvider = getLlmProvider();
  const referencedMachineIds = new Set<string>();
  const referencedDocumentTitles = new Set<string>();
  let finalContent = '죄송합니다, 지금은 답변을 완성하지 못했습니다. 잠시 후 다시 시도해주세요.';

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const result = await llmProvider.complete(messages, toolDefs);

    if (result.toolCalls.length === 0) {
      finalContent = result.content ?? '';
      await prisma.chatMessage.create({
        data: { sessionId: chatSession.id, role: 'ASSISTANT', content: finalContent },
      });
      break;
    }

    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'ASSISTANT',
        content: result.content ?? '',
        toolCalls: JSON.parse(JSON.stringify(result.toolCalls)),
      },
    });
    messages.push({ role: 'assistant', content: result.content ?? '', toolCalls: result.toolCalls });

    for (const call of result.toolCalls) {
      const tool = toolsByName.get(call.name);
      const output = tool ? await tool.execute(call.arguments, { laundromatId }) : toolError(`알 수 없는 도구: ${call.name}`);
      const outputJson = JSON.stringify(output);

      await prisma.chatMessage.create({
        data: { sessionId: chatSession.id, role: 'TOOL', content: outputJson, toolName: call.name, toolCallId: call.id },
      });
      messages.push({ role: 'tool', content: outputJson, toolCallId: call.id, name: call.name });

      collectReferences(call.name, output, referencedMachineIds, referencedDocumentTitles);
    }
  }

  return {
    sessionId: chatSession.id,
    reply: finalContent,
    referencedMachineIds: Array.from(referencedMachineIds),
    referencedDocumentTitles: Array.from(referencedDocumentTitles),
  };
}
