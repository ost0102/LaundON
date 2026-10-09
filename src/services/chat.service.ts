import { apiPost } from './apiClient';
import type { ChatRequest, ChatResponse } from '@/types/chat';

export function sendChatMessage(input: ChatRequest): Promise<ChatResponse> {
  return apiPost<ChatResponse>('/api/ai/chat', input);
}
