import OpenAI from 'openai';

import type { EmbeddingProvider } from './embeddingProvider';

const DEFAULT_MODEL = 'text-embedding-3-small';

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly modelName: string;
  private readonly client: OpenAI;

  constructor(apiKey: string, modelName: string = DEFAULT_MODEL) {
    this.client = new OpenAI({ apiKey });
    this.modelName = modelName;
  }

  async embed(text: string): Promise<number[]> {
    const [vector] = await this.embedBatch([text]);
    return vector;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    const response = await this.client.embeddings.create({ model: this.modelName, input: texts });
    return response.data.map((item) => item.embedding);
  }
}
