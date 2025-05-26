export function formatDate(date: number | string | Date): string {
  if (!date) return "N/A"
  const d = new Date(date)
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

export function formatTime(date: number | string | Date): string {
  if (!date) return "N/A"
  const d = new Date(date)
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}

export function formatDateTime(date: number | string | Date): string {
  if (!date) return "N/A"
  return `${formatDate(date)} at ${formatTime(date)}`
}
