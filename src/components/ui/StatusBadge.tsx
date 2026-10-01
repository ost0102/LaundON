import type { MachineStatus, MachineType } from '@/types/machine';
import { getStatusMeta } from '@/lib/machine';

interface StatusBadgeProps {
  status: MachineStatus;
  type: MachineType;
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const meta = getStatusMeta(status, type);
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.badgeClassName}`}
    >
      <Icon
        className={`h-3.5 w-3.5 ${meta.iconClassName} ${meta.spin ? 'animate-spin' : ''}`}
        aria-hidden="true"
      />
      {meta.label}
    </span>
  );
}
