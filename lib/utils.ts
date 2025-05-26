import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date and time with customizable options
 * @param date Date object or timestamp
 * @param options Intl.DateTimeFormatOptions
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
 * @param date Date object or timestamp
 * @param options Intl.DateTimeFormatOptions
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
