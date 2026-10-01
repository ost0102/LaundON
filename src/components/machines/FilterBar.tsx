'use client';

import { SlidersHorizontal } from 'lucide-react';

import { useLaundryUiStore, type MachineStatusFilter, type MachineTypeFilter } from '@/stores/laundryUiStore';

const TYPE_OPTIONS: { value: MachineTypeFilter; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'WASHER', label: '세탁기' },
  { value: 'DRYER', label: '건조기' },
];

const STATUS_OPTIONS: { value: MachineStatusFilter; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'AVAILABLE', label: '사용 가능' },
  { value: 'RUNNING', label: '사용 중' },
];

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-200 dark:shadow-none'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function FilterBar() {
  const typeFilter = useLaundryUiStore((state) => state.typeFilter);
  const statusFilter = useLaundryUiStore((state) => state.statusFilter);
  const setTypeFilter = useLaundryUiStore((state) => state.setTypeFilter);
  const setStatusFilter = useLaundryUiStore((state) => state.setStatusFilter);

  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
        <SlidersHorizontal className="h-3 w-3" aria-hidden="true" />
        필터
      </p>
      <FilterGroup
        label="기기 종류 필터"
        options={TYPE_OPTIONS}
        value={typeFilter}
        onChange={setTypeFilter}
      />
      <FilterGroup
        label="사용 상태 필터"
        options={STATUS_OPTIONS}
        value={statusFilter}
        onChange={setStatusFilter}
      />
    </div>
  );
}
