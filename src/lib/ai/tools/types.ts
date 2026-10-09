import type { LlmToolDefinition } from '../llmProvider';

export interface ToolContext {
  /** The laundromat the current chat session is scoped to, if any. */
  laundromatId?: string;
}

export interface AiTool {
  definition: LlmToolDefinition;
  /** `argsJson` is the raw JSON string the LLM produced - validate before use. */
  execute(argsJson: string, context: ToolContext): Promise<unknown>;
}

/** Uniform shape so a failed tool call reads to the LLM as "I don't know", never as invented data. */
export function toolError(message: string) {
  return { error: message };
}
