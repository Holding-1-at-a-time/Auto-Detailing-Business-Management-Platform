import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

/**
 * Combines class names with Tailwind's merge utility
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date and time string
 * @param dateString - The date string to format
 * @param formatString - The format string (default: 'PPpp')
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString: string | Date, formatString = "PPpp") {
  if (!dateString) return ""
  const date = typeof dateString === "string" ? parseISO(dateString) : dateString
  return format(date, formatString)
}

/**
 * Formats a date string
 * @param dateString - The date string to format
 * @param formatString - The format string (default: 'PP')
 * @returns Formatted date string
 */
export function formatDate(dateString: string | Date, formatString = "PP") {
  if (!dateString) return ""
  const date = typeof dateString === "string" ? parseISO(dateString) : dateString
  return format(date, formatString)
}

/**
 * Formats a currency value
 * @param value - The value to format
 * @param currency - The currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value)
}

/**
 * Truncates a string to a specified length
 * @param str - The string to truncate
 * @param length - The maximum length
 * @returns Truncated string
 */
export function truncate(str: string, length: number) {
  if (!str) return ""
  return str.length > length ? `${str.substring(0, length)}...` : str
}
