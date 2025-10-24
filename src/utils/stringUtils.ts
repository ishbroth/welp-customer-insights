/**
 * String utility functions
 * @module stringUtils
 */

/**
 * Get initials from a name
 * @param name - Full name
 * @param maxInitials - Maximum number of initials to return (default: 2)
 * @returns Uppercase initials (e.g., "JD" for "John Doe")
 */
export const getInitials = (name: string | null | undefined, maxInitials: number = 2): string => {
  if (!name?.trim()) return "U";

  const names = name.trim().split(/\s+/);
  return names
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, maxInitials);
};

/**
 * Truncate text to a maximum length
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 120)
 * @param suffix - Suffix to add when truncated (default: "...")
 * @returns Truncated text
 */
export const truncateText = (
  text: string,
  maxLength: number = 120,
  suffix: string = "..."
): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
};

/**
 * Capitalize first letter of a string
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export const capitalizeFirst = (text: string): string => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Convert string to slug (URL-friendly format)
 * @param text - Text to convert
 * @returns Slug (e.g., "hello-world" from "Hello World!")
 */
export const toSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
