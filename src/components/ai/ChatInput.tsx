'use client';

import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t border-slate-100 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950"
    >
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="세탁에 대해 무엇이든 물어보세요"
        maxLength={1000}
        disabled={disabled}
        className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="전송"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white transition-colors hover:bg-sky-700 disabled:opacity-40"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
