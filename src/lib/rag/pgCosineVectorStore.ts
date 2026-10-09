import { prisma } from '@/lib/db/prisma';

import type { RetrievedChunk, VectorStore } from './vectorStore';

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Loads every embedding and ranks them in Node. Fine for a knowledge base
 * of up to a few thousand chunks (this app's RAG corpus - usage guides,
 * policies, FAQs - stays well under that); swap for pgvector/Supabase
 * Vector's native `<=>` operator once the corpus grows past that.
 */
export class PgCosineVectorStore implements VectorStore {
  async search(queryVector: number[], topK: number): Promise<RetrievedChunk[]> {
    const embeddings = await prisma.embedding.findMany({
      include: { chunk: { include: { document: true } } },
    });

    const scored = embeddings.map((embedding) => ({
      chunkId: embedding.chunk.id,
      documentId: embedding.chunk.document.id,
      documentTitle: embedding.chunk.document.title,
      documentCategory: embedding.chunk.document.category,
      content: embedding.chunk.content,
      score: cosineSimilarity(queryVector, embedding.vector),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
}
