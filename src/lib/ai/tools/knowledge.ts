import { z } from 'zod';

import { getEmbeddingProvider, getVectorStore } from '@/lib/rag';

import { toolError, type AiTool } from './types';

const getLaundryInformationSchema = z.object({ query: z.string().min(1) });

/**
 * The ONLY tool allowed to touch RAG/Vector search. Everything else in
 * lib/ai/tools/realtime.ts reads live Machine/Laundromat rows - keeping the
 * two apart in code is what guarantees realtime state never gets confused
 * with static knowledge (spec section 9).
 */
export const getLaundryInformationTool: AiTool = {
  definition: {
    name: 'get_laundry_information',
    description:
      '세탁/건조 방법, 소재별 세탁법, 세제 사용법, 세탁소 이용 규칙, 환불 정책 등 정적인 지식을 검색합니다. 기기 상태나 남은 시간 같은 실시간 정보에는 사용하지 마세요.',
    parameters: {
      type: 'object',
      properties: { query: { type: 'string', description: '검색할 질문/키워드' } },
      required: ['query'],
    },
  },
  async execute(argsJson) {
    const parsed = getLaundryInformationSchema.safeParse(JSON.parse(argsJson));
    if (!parsed.success) return toolError('query가 필요합니다.');

    try {
      const embeddingProvider = getEmbeddingProvider();
      const vectorStore = getVectorStore();
      const queryVector = await embeddingProvider.embed(parsed.data.query);
      const results = await vectorStore.search(queryVector, 3);

      if (results.length === 0) return toolError('관련된 문서를 찾지 못했습니다.');

      return {
        documents: results.map((result) => ({
          title: result.documentTitle,
          category: result.documentCategory,
          content: result.content,
          relevance: Math.round(result.score * 100) / 100,
        })),
      };
    } catch (error) {
      return toolError(error instanceof Error ? error.message : '지식 검색에 실패했습니다.');
    }
  },
};

export const knowledgeTools: AiTool[] = [getLaundryInformationTool];
