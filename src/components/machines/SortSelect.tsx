'use client';

import { useId } from 'react';
import { ArrowUpDown } from 'lucide-react';

import { useLaundryUiStore, type MachineSortOption } from '@/stores/laundryUiStore';

const SORT_OPTIONS: { value: MachineSortOption; label: string }[] = [
  { value: 'NUMBER', label: '기기 번호순' },
  { value: 'AVAILABLE_FIRST', label: '사용 가능한 기기 우선' },
  { value: 'REMAINING_ASC', label: '남은 시간이 적은 순' },
];

export function SortSelect() {
  const sortOption = useLaundryUiStore((state) => state.sortOption);
  const setSortOption = useLaundryUiStore((state) => state.setSortOption);
  const selectId = useId();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={selectId} className="flex items-center gap-1 text-xs font-medium text-slate-500">
        <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
        정렬
      </label>
      <select
        id={selectId}
        value={sortOption}
        onChange={(event) => setSortOption(event.target.value as MachineSortOption)}
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
