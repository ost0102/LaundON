import { ApiError, GoogleGenAI } from '@google/genai';
import type { Content, Part, Tool } from '@google/genai';

import type { LlmCompletionResult, LlmMessage, LlmProvider, LlmToolCall, LlmToolDefinition } from './llmProvider';

// A pinned "-lite" model: flagship models (gemini-3.8-flash) cap the free
// tier at 20 requests/day, which one multi-tool-call chat turn can burn
// through by itself - lite models have a much higher free daily quota and
// still support tool calling. Also avoids the "-latest" alias (can point at
// a just-released, oversubscribed model - observed 503s) and old pinned
// versions that get sunset for new API keys (observed: gemini-2.5-flash
// 404ing with "no longer available to new users").
const DEFAULT_MODEL = 'gemini-3.1-flash-lite';

// Gemini's free tier returns 503 ("high demand... usually temporary") and
// 429 (rate limit) fairly often - retrying a couple of times with backoff
// clears most of them without the user ever seeing an error.
const RETRYABLE_STATUS = new Set([429, 503]);
const MAX_RETRIES = 2;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeParseJsonObject(text: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : { result: parsed };
  } catch {
    return { result: text };
  }
}

/**
 * Gemini has no separate "system" role - it takes one systemInstruction
 * string per request - and no "tool" role - a tool result is a `user`-role
 * Content carrying a `functionResponse` part instead of text (matches the
 * Gemini API's function calling convention).
 */
function toGeminiContents(messages: LlmMessage[]): { systemInstruction?: string; contents: Content[] } {
  let systemInstruction: string | undefined;
  const contents: Content[] = [];

  for (const message of messages) {
    if (message.role === 'system') {
      systemInstruction = systemInstruction ? `${systemInstruction}\n\n${message.content}` : message.content;
      continue;
    }

    if (message.role === 'user') {
      contents.push({ role: 'user', parts: [{ text: message.content }] });
      continue;
    }

    if (message.role === 'assistant') {
      const parts: Part[] = [];
      if (message.content) parts.push({ text: message.content });
      for (const call of message.toolCalls ?? []) {
        const thoughtSignature = call.metadata?.thoughtSignature;
        parts.push({
          functionCall: { id: call.id, name: call.name, args: safeParseJsonObject(call.arguments) },
          // Gemini 2.5+/3.x require the exact thoughtSignature from the turn
          // that produced this function call to be echoed back, or the next
          // generateContent call 400s. See
          // https://ai.google.dev/gemini-api/docs/thought-signatures
          ...(typeof thoughtSignature === 'string' ? { thoughtSignature } : {}),
        });
      }
      contents.push({ role: 'model', parts });
      continue;
    }

    // role === 'tool'
    contents.push({
      role: 'user',
      parts: [
        {
          functionResponse: {
            id: message.toolCallId,
            name: message.name ?? '',
            response: safeParseJsonObject(message.content),
          },
        },
      ],
    });
  }

  return { systemInstruction, contents };
}

function toGeminiTools(tools: LlmToolDefinition[]): Tool[] {
  return [
    {
      functionDeclarations: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parametersJsonSchema: tool.parameters,
      })),
    },
  ];
}

export class GeminiProvider implements LlmProvider {
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor(apiKey: string, model: string = DEFAULT_MODEL) {
    this.client = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  async complete(messages: LlmMessage[], tools: LlmToolDefinition[]): Promise<LlmCompletionResult> {
    const { systemInstruction, contents } = toGeminiContents(messages);

    let response;
    for (let attempt = 0; ; attempt++) {
      try {
        response = await this.client.models.generateContent({
          model: this.model,
          contents,
          config: {
            systemInstruction,
            tools: tools.length > 0 ? toGeminiTools(tools) : undefined,
            temperature: 0.3,
          },
        });
        break;
      } catch (error) {
        const status = error instanceof ApiError ? error.status : undefined;
        if (status && RETRYABLE_STATUS.has(status) && attempt < MAX_RETRIES) {
          await sleep(500 * 2 ** attempt);
          continue;
        }
        throw error;
      }
    }

    // Walk the raw parts (not the response.functionCalls convenience getter)
    // because thoughtSignature lives on the Part, not on the FunctionCall.
    const rawParts = response.candidates?.[0]?.content?.parts ?? [];
    const toolCalls: LlmToolCall[] = rawParts
      .filter((part): part is Part & { functionCall: NonNullable<Part['functionCall']> } => Boolean(part.functionCall))
      .map((part, index) => ({
        id: part.functionCall.id ?? `call_${index}`,
        name: part.functionCall.name ?? '',
        arguments: JSON.stringify(part.functionCall.args ?? {}),
        metadata: part.thoughtSignature ? { thoughtSignature: part.thoughtSignature } : undefined,
      }));

    return { content: response.text ?? null, toolCalls };
  }
}
