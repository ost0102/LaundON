import { Loader2 } from 'lucide-react';

export function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2">
      <Loader2 className="h-6 w-6 animate-spin text-sky-500" aria-hidden="true" />
      <span className="sr-only">불러오는 중</span>
    </div>
  );
}
