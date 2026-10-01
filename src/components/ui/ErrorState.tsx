import { AlertCircle, RotateCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = '정보를 불러오지 못했습니다.', onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-rose-100 bg-rose-50 p-6 text-center dark:border-rose-500/20 dark:bg-rose-500/10"
    >
      <AlertCircle className="h-6 w-6 text-rose-500" aria-hidden="true" />
      <p className="text-sm font-medium text-rose-700 dark:text-rose-400">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
        >
          <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
          다시 시도
        </button>
      )}
    </div>
  );
}
