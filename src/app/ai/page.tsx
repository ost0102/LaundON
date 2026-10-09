'use client';

import { Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, Loader2, Sparkles } from 'lucide-react';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { ChatInput } from '@/components/ai/ChatInput';
import { ChatMessageBubble } from '@/components/ai/ChatMessageBubble';
import { useChat } from '@/hooks/useChat';

const SUGGESTIONS = [
  '지금 세탁할 수 있는 세탁기 있어?',
  '이불 빨래하려는데 어떤 코스를 써야 해?',
  '운동복이랑 수건을 같이 빨아도 돼?',
];

function AiChatContent() {
  const searchParams = useSearchParams();
  const laundromatId = searchParams.get('storeId') ?? undefined;

  const { messages, sendMessage, isPending } = useChat(laundromatId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isPending]);

  return (
    <main className="flex h-dvh flex-col">
      <header className="flex items-center gap-2 border-b border-slate-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
        <Link href={laundromatId ? `/stores/${laundromatId}` : '/home'} className="text-slate-700 dark:text-slate-200">
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <Sparkles className="h-4 w-4 text-sky-500" aria-hidden="true" />
        <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100">AI 세탁 도우미</h1>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-slate-400">세탁기 상태, 세탁/건조 코스, 소재별 세탁법 등을 물어보세요.</p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-left text-xs text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {messages.map((message) => (
            <ChatMessageBubble key={message.id} message={message} laundromatId={laundromatId} />
          ))}

          {isPending && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              답변을 생성하는 중...
            </div>
          )}
        </div>
      </div>

      <ChatInput onSend={sendMessage} disabled={isPending} />
    </main>
  );
}

export default function AiChatPage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <AiChatContent />
      </Suspense>
    </RequireAuth>
  );
}
