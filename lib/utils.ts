import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names into a single string, handling Tailwind conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date and time with customizable options
 * @param date Date object or timestamp to format
 * @param options Intl.DateTimeFormatOptions for customizing the output
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | number, options: Intl.DateTimeFormatOptions = {}): string {
  const dateObj = typeof date === "number" ? new Date(date) : date

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }

  return new Intl.DateTimeFormat("en-US", defaultOptions).format(dateObj)
}

/**
 * Formats just the date portion with customizable options
 * @param date Date object or timestamp to format
 * @param options Intl.DateTimeFormatOptions for customizing the output
 * @returns Formatted date string
 */
export function formatDate(date: Date | number, options: Intl.DateTimeFormatOptions = {}): string {
  const dateObj = typeof date === "number" ? new Date(date) : date

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }

  return new Intl.DateTimeFormat("en-US", defaultOptions).format(dateObj)
}

/**
 * Formats a currency amount
 * @param amount Number to format as currency
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

/**
 * Truncates a string to a maximum length and adds an ellipsis if needed
 * @param str String to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated string
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + "..."
}

/**
 * Generates initials from a name (e.g., "John Doe" -> "JD")
 * @param name Full name to generate initials from
 * @returns String containing the initials
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
