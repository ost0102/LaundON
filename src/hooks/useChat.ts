import { useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { ApiError } from '@/services/apiClient';
import { sendChatMessage } from '@/services/chat.service';
import type { ChatMessageView } from '@/types/chat';

export function useChat(laundromatId?: string) {
  const [messages, setMessages] = useState<ChatMessageView[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  const mutation = useMutation({
    mutationFn: (message: string) => sendChatMessage({ sessionId, laundromatId, message }),
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          referencedMachineIds: data.referencedMachineIds,
          referencedDocumentTitles: data.referencedDocumentTitles,
        },
      ]);
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : '답변을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.';
      setMessages((prev) => [...prev, { id: `error-${Date.now()}`, role: 'assistant', content: message }]);
    },
  });

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: 'user', content: trimmed }]);
      mutation.mutate(trimmed);
    },
    [mutation],
  );

  return {
    messages,
    sendMessage,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
}
