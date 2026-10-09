export type LlmRole = 'system' | 'user' | 'assistant' | 'tool';

export interface LlmToolCall {
  id: string;
  name: string;
  /** Raw JSON string, as returned by the provider - parse per-tool with a zod schema before use. */
  arguments: string;
  /**
   * Provider-specific data that must be echoed back verbatim on the next
   * turn for multi-turn tool calling to work (e.g. Gemini's
   * `thoughtSignature` - see geminiProvider.ts). Opaque to everything
   * outside the provider that set it.
   */
  metadata?: Record<string, unknown>;
}

export interface LlmMessage {
  role: LlmRole;
  /** Empty string when an assistant message carries only tool calls. */
  content: string;
  toolCalls?: LlmToolCall[];
  /** Required on role "tool" messages - must match the LlmToolCall.id it answers. */
  toolCallId?: string;
  /** Required on role "tool" messages - the tool's name. */
  name?: string;
}

export interface LlmToolDefinition {
  name: string;
  description: string;
  /** JSON Schema object describing the tool's arguments. */
  parameters: Record<string, unknown>;
}

export interface LlmCompletionResult {
  content: string | null;
  toolCalls: LlmToolCall[];
}

/**
 * Abstraction over "a chat model that supports tool calling", so the
 * concrete provider (OpenAI today, Gemini or anything else tomorrow) is a
 * one-line swap - see lib/ai/index.ts. Nothing outside lib/ai should import
 * an SDK-specific type.
 */
export interface LlmProvider {
  complete(messages: LlmMessage[], tools: LlmToolDefinition[]): Promise<LlmCompletionResult>;
}
