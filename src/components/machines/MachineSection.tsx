import type { LucideIcon } from 'lucide-react';

import { EmptyState } from '@/components/ui/EmptyState';
import { MachineCard } from '@/components/machines/MachineCard';
import type { LiveMachine } from '@/lib/machine';

interface MachineSectionProps {
  title: string;
  icon: LucideIcon;
  availableCount: number;
  totalCount: number;
  items: LiveMachine[];
}

export function MachineSection({
  title,
  icon: Icon,
  availableCount,
  totalCount,
  items,
}: MachineSectionProps) {
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-slate-100">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          {title}
        </h2>
        <span className="text-xs font-medium text-slate-400">
          {availableCount}/{totalCount}대 사용 가능
        </span>
      </div>

      {items.length === 0 ? (
        <EmptyState title="조건에 맞는 기기가 없어요" description="필터를 변경해보세요" />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {items.map(({ machine, live }) => (
            <MachineCard key={machine.id} machine={machine} live={live} />
          ))}
        </div>
      )}
    </section>
  );
}
