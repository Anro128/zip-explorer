// formatSize utility
export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exp = Math.min(Math.floor(Math.log2(bytes) / 10), units.length - 1);
  const val = bytes / Math.pow(1024, exp);
  return `${val < 10 ? val.toFixed(1) : Math.round(val)} ${units[exp]}`;
}

export function formatDate(date: Date | null | undefined): string {
  if (!date) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
