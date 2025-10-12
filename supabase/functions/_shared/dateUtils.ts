/**
 * Centralized date/time utilities for Deno Edge Functions
 * UTC handling and DST safety
 *
 * All dates stored in database as UTC (ISO 8601 strings)
 * All date arithmetic is DST-safe
 *
 * @module dateUtils (Deno)
 */

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
    const date = new Date(isoString);
    return !isNaN(date.getTime()) ? date : null;
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
 * This implementation is safe because it operates in UTC milliseconds
 *
 * @param date - Starting date
 * @param hours - Number of hours to add (can be negative)
 * @returns New Date object
 */
export const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date);
  result.setTime(result.getTime() + hours * 60 * 60 * 1000);
  return result;
};

/**
 * Add minutes to a date (DST-safe)
 * This implementation is safe because it operates in UTC milliseconds
 *
 * @param date - Starting date
 * @param minutes - Number of minutes to add (can be negative)
 * @returns New Date object
 */
export const addMinutes = (date: Date, minutes: number): Date => {
  const result = new Date(date);
  result.setTime(result.getTime() + minutes * 60 * 1000);
  return result;
};

/**
 * Add days to a date (DST-safe)
 * This implementation is safe because it operates in UTC milliseconds
 *
 * @param date - Starting date
 * @param days - Number of days to add (can be negative)
 * @returns New Date object
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setTime(result.getTime() + days * 24 * 60 * 60 * 1000);
  return result;
};

/**
 * Check if date1 is before date2
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns true if date1 < date2
 */
export const isBefore = (date1: Date, date2: Date): boolean => {
  return date1.getTime() < date2.getTime();
};

/**
 * Check if date1 is after date2
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns true if date1 > date2
 */
export const isAfter = (date1: Date, date2: Date): boolean => {
  return date1.getTime() > date2.getTime();
};

/**
 * Check if a date is valid
 *
 * @param date - Date to validate
 * @returns true if date is valid
 */
export const isValidDate = (date: Date | string): boolean => {
  const parsedDate = typeof date === 'string' ? parseISOString(date) : date;
  return parsedDate !== null && !isNaN(parsedDate.getTime());
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
