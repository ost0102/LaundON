import { prisma } from '@/lib/db/prisma';

import { chunkText } from './chunk';
import { getEmbeddingProvider } from './index';

export async function indexDocument(documentId: string): Promise<{ chunkCount: number }> {
  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) throw new Error(`문서를 찾을 수 없습니다: ${documentId}`);

  const embeddingProvider = getEmbeddingProvider();
  const chunks = chunkText(document.content);
  const vectors = await embeddingProvider.embedBatch(chunks);

  await prisma.$transaction(async (tx) => {
    await tx.documentChunk.deleteMany({ where: { documentId } });

    for (let i = 0; i < chunks.length; i++) {
      const chunk = await tx.documentChunk.create({
        data: { documentId, chunkIndex: i, content: chunks[i] },
      });
      await tx.embedding.create({
        data: { chunkId: chunk.id, vector: vectors[i], model: embeddingProvider.modelName },
      });
    }
  });

  return { chunkCount: chunks.length };
}

export async function indexAllDocuments(): Promise<void> {
  const documents = await prisma.document.findMany({ select: { id: true } });
  for (const document of documents) {
    await indexDocument(document.id);
  }
}
