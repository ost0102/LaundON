import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';

import type { LlmCompletionResult, LlmMessage, LlmProvider, LlmToolCall, LlmToolDefinition } from './llmProvider';

const DEFAULT_MODEL = 'gpt-4o-mini';

function toOpenAiMessages(messages: LlmMessage[]): ChatCompletionMessageParam[] {
  return messages.map((message) => {
    if (message.role === 'tool') {
      return {
        role: 'tool',
        tool_call_id: message.toolCallId ?? '',
        content: message.content,
      };
    }

    if (message.role === 'assistant') {
      return {
        role: 'assistant',
        content: message.content || null,
        tool_calls: message.toolCalls?.map((call) => ({
          id: call.id,
          type: 'function' as const,
          function: { name: call.name, arguments: call.arguments },
        })),
      };
    }

    return { role: message.role, content: message.content };
  });
}

function toOpenAiTools(tools: LlmToolDefinition[]): ChatCompletionTool[] {
  return tools.map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}

export class OpenAIProvider implements LlmProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(apiKey: string, model: string = DEFAULT_MODEL) {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async complete(messages: LlmMessage[], tools: LlmToolDefinition[]): Promise<LlmCompletionResult> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: toOpenAiMessages(messages),
      tools: tools.length > 0 ? toOpenAiTools(tools) : undefined,
      temperature: 0.3,
    });

    const choice = response.choices[0]?.message;
    const toolCalls: LlmToolCall[] = (choice?.tool_calls ?? [])
      .filter((call) => call.type === 'function')
      .map((call) => ({ id: call.id, name: call.function.name, arguments: call.function.arguments }));

    return { content: choice?.content ?? null, toolCalls };
  }
}
