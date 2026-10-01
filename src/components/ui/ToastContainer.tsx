'use client';

import { useEffect } from 'react';
import { BellRing, X } from 'lucide-react';

import { useNotificationStore } from '@/stores/notificationStore';

const AUTO_DISMISS_MS = 6000;

export function ToastContainer() {
  const toasts = useNotificationStore((state) => state.toasts);
  const dismissToast = useNotificationStore((state) => state.dismissToast);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) => setTimeout(() => dismissToast(toast.id), AUTO_DISMISS_MS));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismissToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg"
        >
          <span className="flex items-center gap-2">
            <BellRing className="h-4 w-4 shrink-0 text-sky-400" aria-hidden="true" />
            {toast.message}
          </span>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="알림 닫기"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
