import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth/requireAdmin';
import { indexDocument, indexAllDocuments } from '@/lib/rag/indexDocument';

const embedRequestSchema = z.object({ documentId: z.string().optional() });

/** Generates/refreshes embeddings for one document (or every document when documentId is omitted). */
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => ({}));
  const parsed = embedRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  try {
    if (parsed.data.documentId) {
      const result = await indexDocument(parsed.data.documentId);
      return NextResponse.json(result);
    }
    await indexAllDocuments();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[embeddings] failed', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : '임베딩 생성에 실패했습니다.' },
      { status: 502 },
    );
  }
}
