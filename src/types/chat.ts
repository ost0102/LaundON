export interface ChatRequest {
  sessionId?: string;
  laundromatId?: string;
  message: string;
}

export interface ChatResponse {
  sessionId: string;
  reply: string;
  referencedMachineIds: string[];
  referencedDocumentTitles: string[];
}

export interface ChatMessageView {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  referencedMachineIds?: string[];
  referencedDocumentTitles?: string[];
}
