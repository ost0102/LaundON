import { knowledgeTools } from './knowledge';
import { realtimeTools } from './realtime';
import type { AiTool } from './types';

export * from './types';
export { realtimeTools } from './realtime';
export { knowledgeTools } from './knowledge';

export const allTools: AiTool[] = [...realtimeTools, ...knowledgeTools];
