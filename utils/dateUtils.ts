/**
    * @description      : 
    * @author           : rrome
    * @group            : 
    * @created          : 26/05/2025 - 09:42:12
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 26/05/2025
    * - Author          : rrome
    * - Modification    : 
**/
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
