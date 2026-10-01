/** Formats seconds as "MM:SS", e.g. 1112 -> "18:32". */
export function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/** Formats seconds as a short Korean label, e.g. 1112 -> "18분 남음". */
export function formatRemainingLabel(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.ceil(safeSeconds / 60);
  return `${minutes}분 남음`;
}

/** Formats an ISO timestamp as a Korean "HH:mm" clock time, e.g. "13:05". */
export function formatClockTime(isoString: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  }).format(new Date(isoString));
}
