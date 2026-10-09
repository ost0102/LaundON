import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getEmbeddingProvider, getVectorStore } from '@/lib/rag';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const searchRequestSchema = z.object({
  query: z.string().trim().min(1).max(300),
  topK: z.number().int().min(1).max(10).optional(),
});

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(getClientIp(request), 30, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = searchRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  try {
    const embeddingProvider = getEmbeddingProvider();
    const vectorStore = getVectorStore();
    const queryVector = await embeddingProvider.embed(parsed.data.query);
    const results = await vectorStore.search(queryVector, parsed.data.topK ?? 5);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('[ai/search] failed', error);
    return NextResponse.json({ message: '검색에 실패했습니다.' }, { status: 502 });
  }
}
