import Link from 'next/link';
import { BookOpen, WashingMachine } from 'lucide-react';

import type { ChatMessageView } from '@/types/chat';

interface ChatMessageBubbleProps {
  message: ChatMessageView;
  laundromatId?: string;
}

export function ChatMessageBubble({ message, laundromatId }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex max-w-[85%] flex-col gap-1.5 rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-sky-600 text-white'
            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {!isUser && message.referencedMachineIds && message.referencedMachineIds.length > 0 && laundromatId && (
          <Link
            href={`/stores/${laundromatId}`}
            className="flex w-fit items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-medium text-sky-600 shadow-sm dark:bg-slate-900"
          >
            <WashingMachine className="h-3.5 w-3.5" aria-hidden="true" />
            기기 상태 보기
          </Link>
        )}

        {!isUser && message.referencedDocumentTitles && message.referencedDocumentTitles.length > 0 && (
          <p className="flex items-start gap-1 text-[11px] text-slate-400">
            <BookOpen className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
            참고: {message.referencedDocumentTitles.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
