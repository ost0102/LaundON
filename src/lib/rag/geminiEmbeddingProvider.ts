import { GoogleGenAI } from '@google/genai';

import type { EmbeddingProvider } from './embeddingProvider';

const DEFAULT_MODEL = 'gemini-embedding-001';

export class GeminiEmbeddingProvider implements EmbeddingProvider {
  readonly modelName: string;
  private readonly client: GoogleGenAI;

  constructor(apiKey: string, modelName: string = DEFAULT_MODEL) {
    this.client = new GoogleGenAI({ apiKey });
    this.modelName = modelName;
  }

  async embed(text: string): Promise<number[]> {
    const [vector] = await this.embedBatch([text]);
    return vector;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    const response = await this.client.models.embedContent({ model: this.modelName, contents: texts });
    return (response.embeddings ?? []).map((embedding) => embedding.values ?? []);
  }
}
