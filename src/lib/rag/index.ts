import { GeminiEmbeddingProvider } from './geminiEmbeddingProvider';
import { PgCosineVectorStore } from './pgCosineVectorStore';
import type { EmbeddingProvider } from './embeddingProvider';
import type { VectorStore } from './vectorStore';

export * from './embeddingProvider';
export * from './vectorStore';

let _embeddingProvider: EmbeddingProvider | undefined;
let _vectorStore: VectorStore | undefined;

// Lazily constructed so importing this module doesn't throw at server boot
// just because GEMINI_API_KEY isn't set yet - only AI/RAG request handlers
// pay that cost, and only when they're actually hit. Swap for
// OpenAIEmbeddingProvider (openaiEmbeddingProvider.ts - already implemented)
// to change embedding models app-wide; re-embed all documents afterward,
// since vectors from different models aren't comparable.
export function getEmbeddingProvider(): EmbeddingProvider {
  if (!_embeddingProvider) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    _embeddingProvider = new GeminiEmbeddingProvider(apiKey);
  }
  return _embeddingProvider;
}

export function getVectorStore(): VectorStore {
  if (!_vectorStore) _vectorStore = new PgCosineVectorStore();
  return _vectorStore;
}
