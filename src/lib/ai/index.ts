import { GeminiProvider } from './geminiProvider';
import type { LlmProvider } from './llmProvider';

export * from './llmProvider';

let _llmProvider: LlmProvider | undefined;

// Lazily constructed - see lib/rag/index.ts for why. Swap this one line for
// an OpenAIProvider (see openaiProvider.ts - already implemented, just
// unused by default) or anything else implementing LlmProvider to change
// models app-wide.
export function getLlmProvider(): LlmProvider {
  if (!_llmProvider) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    _llmProvider = new GeminiProvider(apiKey, process.env.GEMINI_CHAT_MODEL);
  }
  return _llmProvider;
}
