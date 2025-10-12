/**
 * Centralized date/time utilities with UTC handling and DST safety
 *
 * All functions use date-fns for DST-safe operations.
 * Database storage: Always use UTC (ISO 8601 strings)
 * Display: Convert to user's local timezone
 *
 * @module dateUtils
 */

import {
  formatDistance as dateFnsFormatDistance,
  format as dateFnsFormat,
  addHours as dateFnsAddHours,
  addMinutes as dateFnsAddMinutes,
  addDays as dateFnsAddDays,
  isBefore as dateFnsIsBefore,
  isAfter as dateFnsIsAfter,
  parseISO,
  isValid
} from 'date-fns';

/**
 * Get current time in UTC
 * Use this instead of `new Date()`
 */
export const now = (): Date => {
  return new Date();
};

/**
 * Parse ISO string to Date object
 * Safely handles database timestamps
 *
 * @param isoString - ISO 8601 date string (e.g., "2024-03-10T14:30:00.000Z")
 * @returns Date object or null if invalid
 */
export const parseISOString = (isoString: string): Date | null => {
  try {
    const date = parseISO(isoString);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
};

/**
 * Convert Date to ISO string for database storage
 * Always stores in UTC format
 *
 * @param date - Date object
 * @returns ISO 8601 string (e.g., "2024-03-10T14:30:00.000Z")
 */
export const toISOString = (date: Date): string => {
  return date.toISOString();
};

/**
 * Add hours to a date (DST-safe)
 * Handles DST transitions correctly
 *
 * @param date - Starting date
 * @param hours - Number of hours to add (can be negative)
 * @returns New Date object
 */
export const addHours = (date: Date, hours: number): Date => {
  return dateFnsAddHours(date, hours);
};

/**
 * Add minutes to a date (DST-safe)
 * Handles DST transitions correctly
 *
 * @param date - Starting date
 * @param minutes - Number of minutes to add (can be negative)
 * @returns New Date object
 */
export const addMinutes = (date: Date, minutes: number): Date => {
  return dateFnsAddMinutes(date, minutes);
};

/**
 * Add days to a date (DST-safe)
 * Handles DST transitions correctly
 *
 * @param date - Starting date
 * @param days - Number of days to add (can be negative)
 * @returns New Date object
 */
export const addDays = (date: Date, days: number): Date => {
  return dateFnsAddDays(date, days);
};

/**
 * Check if date1 is before date2
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns true if date1 < date2
 */
export const isBefore = (date1: Date, date2: Date): boolean => {
  return dateFnsIsBefore(date1, date2);
};

/**
 * Check if date1 is after date2
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns true if date1 > date2
 */
export const isAfter = (date1: Date, date2: Date): boolean => {
  return dateFnsIsAfter(date1, date2);
};

/**
 * Format date as relative time (e.g., "2 hours ago", "in 3 days")
 * DST-safe via date-fns
 *
 * @param date - Date to format (can be Date object or ISO string)
 * @param baseDate - Date to compare against (defaults to now)
 * @returns Formatted string
 */
export const formatRelative = (
  date: Date | string,
  baseDate: Date = now()
): string => {
  const parsedDate = typeof date === 'string' ? parseISOString(date) : date;
  if (!parsedDate) return 'Invalid date';

  return dateFnsFormatDistance(parsedDate, baseDate, { addSuffix: true });
};

/**
 * Format date and time in user's local timezone
 *
 * @param date - Date to format (can be Date object or ISO string)
 * @param formatPattern - Optional format pattern (default: "MMM d, yyyy 'at' h:mm a")
 * @returns Formatted string
 */
export const formatDateTime = (
  date: Date | string,
  formatPattern: string = "MMM d, yyyy 'at' h:mm a"
): string => {
  const parsedDate = typeof date === 'string' ? parseISOString(date) : date;
  if (!parsedDate) return 'Invalid date';

  return dateFnsFormat(parsedDate, formatPattern);
};

/**
 * Format date only (no time) in user's local timezone
 *
 * @param date - Date to format (can be Date object or ISO string)
 * @param formatPattern - Optional format pattern (default: "MMM d, yyyy")
 * @returns Formatted string
 */
export const formatDate = (
  date: Date | string,
  formatPattern: string = "MMM d, yyyy"
): string => {
  const parsedDate = typeof date === 'string' ? parseISOString(date) : date;
  if (!parsedDate) return 'Invalid date';

  return dateFnsFormat(parsedDate, formatPattern);
};

/**
 * Format time only (no date) in user's local timezone
 *
 * @param date - Date to format (can be Date object or ISO string)
 * @param formatPattern - Optional format pattern (default: "h:mm a")
 * @returns Formatted string
 */
export const formatTime = (
  date: Date | string,
  formatPattern: string = "h:mm a"
): string => {
  const parsedDate = typeof date === 'string' ? parseISOString(date) : date;
  if (!parsedDate) return 'Invalid date';

  return dateFnsFormat(parsedDate, formatPattern);
};

/**
 * Check if a date is valid
 *
 * @param date - Date to validate
 * @returns true if date is valid
 */
export const isValidDate = (date: Date | string): boolean => {
  const parsedDate = typeof date === 'string' ? parseISOString(date) : date;
  return parsedDate !== null && isValid(parsedDate);
};

/**
 * Check if a date/time has expired (is in the past)
 *
 * @param expiryDate - Date to check (can be Date object or ISO string)
 * @returns true if expired
 */
export const isExpired = (expiryDate: Date | string): boolean => {
  const parsedDate = typeof expiryDate === 'string' ? parseISOString(expiryDate) : expiryDate;
  if (!parsedDate) return true; // Treat invalid dates as expired

  return isBefore(parsedDate, now());
};

/**
 * Get user's timezone
 *
 * @returns IANA timezone string (e.g., "America/New_York")
 */
export const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
};
