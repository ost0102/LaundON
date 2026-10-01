interface ProgressBarProps {
  progress: number;
  label: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-600 transition-[width] duration-500 ease-linear"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
