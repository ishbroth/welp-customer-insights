/**
 * Safe storage utility (localStorage + sessionStorage) with quota exceeded handling
 *
 * Prevents QuotaExceededError from breaking the application
 */

import { logger } from './logger';

const storageLogger = logger.withContext('SafeStorage');

/**
 * Safely get an item from localStorage
 * Returns null if localStorage is unavailable or an error occurs
 */
export const safeGetItem = (key: string, storage: Storage = localStorage): string | null => {
  try {
    return storage.getItem(key);
  } catch (error) {
    storageLogger.warn(`Error reading from storage (key: ${key}):`, error);
    return null;
  }
};

/**
 * Safely set an item in storage (localStorage or sessionStorage)
 * If quota is exceeded, tries to clear old items and retry
 * Returns true if successful, false otherwise
 */
export const safeSetItem = (key: string, value: string, storage: Storage = localStorage): boolean => {
  try {
    storage.setItem(key, value);
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      storageLogger.warn('Storage quota exceeded, attempting to clear space...');

      // Try to clear some space by removing old data
      try {
        if (storage === localStorage) {
          clearOldReactions();
        } else {
          clearOldSessionData();
        }

        // Retry the operation
        try {
          storage.setItem(key, value);
          storageLogger.info('Successfully saved after clearing space');
          return true;
        } catch (retryError) {
          storageLogger.error('Still failed after clearing space:', retryError);
          return false;
        }
      } catch (clearError) {
        storageLogger.error('Error clearing storage:', clearError);
        return false;
      }
    } else {
      storageLogger.error(`Error writing to storage (key: ${key}):`, error);
      return false;
    }
  }
};

/**
 * Safely remove an item from storage
 */
export const safeRemoveItem = (key: string, storage: Storage = localStorage): void => {
  try {
    storage.removeItem(key);
  } catch (error) {
    storageLogger.warn(`Error removing from storage (key: ${key}):`, error);
  }
};

/**
 * Clear old reaction data from localStorage to free up space
 * Keeps only the most recent 100 reaction entries
 */
const clearOldReactions = (): void => {
  try {
    const reactionKeys: string[] = [];

    // Find all reaction keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('reactions_')) {
        reactionKeys.push(key);
      }
    }

    // If we have more than 100 reaction entries, remove the oldest ones
    if (reactionKeys.length > 100) {
      const keysToRemove = reactionKeys.slice(0, reactionKeys.length - 100);
      storageLogger.info(`Removing ${keysToRemove.length} old reaction entries from localStorage`);

      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          storageLogger.warn(`Failed to remove key ${key}:`, error);
        }
      });
    }
  } catch (error) {
    storageLogger.error('Error clearing old reactions:', error);
  }
};

/**
 * Clear old sessionStorage data (review caches) to free up space
 */
const clearOldSessionData = (): void => {
  try {
    const reviewCacheKeys: string[] = [];

    // Find all profile review cache keys
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('profileReviews_')) {
        reviewCacheKeys.push(key);
      }
    }

    // Remove all old cache entries
    if (reviewCacheKeys.length > 0) {
      storageLogger.info(`Removing ${reviewCacheKeys.length} old review cache entries from sessionStorage`);

      reviewCacheKeys.forEach(key => {
        try {
          sessionStorage.removeItem(key);
        } catch (error) {
          storageLogger.warn(`Failed to remove key ${key}:`, error);
        }
      });
    }
  } catch (error) {
    storageLogger.error('Error clearing old session data:', error);
  }
};

/**
 * Get localStorage usage information (if available)
 */
export const getStorageInfo = (): { used: number; available: number } | null => {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        const used = estimate.usage || 0;
        const available = estimate.quota || 0;
        const percentUsed = ((used / available) * 100).toFixed(2);
        storageLogger.debug(`localStorage usage: ${percentUsed}% (${used} / ${available} bytes)`);
      });
    }
    return null;
  } catch (error) {
    storageLogger.warn('Error getting storage info:', error);
    return null;
  }
};

/**
 * Clear ALL reaction data from localStorage (use with caution)
 */
export const clearAllReactions = (): number => {
  try {
    let cleared = 0;
    const keysToRemove: string[] = [];

    // Find all reaction keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('reactions_')) {
        keysToRemove.push(key);
      }
    }

    // Remove them
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
        cleared++;
      } catch (error) {
        storageLogger.warn(`Failed to remove key ${key}:`, error);
      }
    });

    storageLogger.info(`Cleared ${cleared} reaction entries from localStorage`);
    return cleared;
  } catch (error) {
    storageLogger.error('Error clearing all reactions:', error);
    return 0;
  }
};
