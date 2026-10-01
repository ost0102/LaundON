import { WashingMachine, Wind } from 'lucide-react';

interface StoreStatusSummaryProps {
  washerAvailable: number;
  washerTotal: number;
  dryerAvailable: number;
  dryerTotal: number;
}

export function StoreStatusSummary({
  washerAvailable,
  washerTotal,
  dryerAvailable,
  dryerTotal,
}: StoreStatusSummaryProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 p-4 text-white shadow-sm shadow-sky-200 dark:shadow-none">
      <p className="text-xs font-medium text-sky-100">현재 사용 가능한 기기</p>
      <dl className="mt-2 flex gap-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <WashingMachine className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <dt className="text-[11px] text-sky-100">세탁기</dt>
            <dd className="text-lg font-bold tabular-nums leading-tight">
              {washerAvailable} / {washerTotal}
            </dd>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <Wind className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <dt className="text-[11px] text-sky-100">건조기</dt>
            <dd className="text-lg font-bold tabular-nums leading-tight">
              {dryerAvailable} / {dryerTotal}
            </dd>
          </div>
        </div>
      </dl>
    </div>
  );
}
