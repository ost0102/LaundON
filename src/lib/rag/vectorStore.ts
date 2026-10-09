export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  documentCategory: string;
  content: string;
  score: number;
}

/**
 * Where document embeddings are searched. Swappable for a native pgvector
 * (or Supabase Vector) implementation later without touching callers - see
 * lib/rag/pgCosineVectorStore.ts for the current app-side cosine similarity
 * implementation, used because plain Postgres doesn't have pgvector
 * installed on this machine yet (see docs/architecture.md).
 */
export interface VectorStore {
  search(queryVector: number[], topK: number): Promise<RetrievedChunk[]>;
}
