import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date and time according to the specified locale and options
 * @param date The date to format
 * @param options Intl.DateTimeFormatOptions
 * @param locale The locale to use for formatting
 * @returns Formatted date and time string
 */
export function formatDateTime(
  date: Date | number,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  },
  locale = "en-US",
): string {
  const dateToFormat = typeof date === "number" ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, options).format(dateToFormat)
}

/**
 * Formats a date according to the specified locale and options
 * @param date The date to format
 * @param options Intl.DateTimeFormatOptions
 * @param locale The locale to use for formatting
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | number,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
  locale = "en-US",
): string {
  const dateToFormat = typeof date === "number" ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, options).format(dateToFormat)
}
