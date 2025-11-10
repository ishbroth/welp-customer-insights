import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { logger } from './logger';

const cacheLogger = logger.withContext('OfflineCache');

interface CacheDB extends DBSchema {
  profiles: {
    key: string;
    value: {
      id: string;
      data: any;
      timestamp: number;
      expiresAt: number;
    };
  };
  reviews: {
    key: string;
    value: {
      id: string;
      data: any;
      timestamp: number;
      expiresAt: number;
    };
  };
}

const DB_NAME = 'welp-offline-cache';
const DB_VERSION = 1;
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

let dbPromise: Promise<IDBPDatabase<CacheDB>> | null = null;

/**
 * Initialize the IndexedDB database
 */
const getDB = async (): Promise<IDBPDatabase<CacheDB>> => {
  if (dbPromise) return dbPromise;

  dbPromise = openDB<CacheDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('profiles')) {
        db.createObjectStore('profiles', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('reviews')) {
        db.createObjectStore('reviews', { keyPath: 'id' });
      }
    },
  });

  return dbPromise;
};

/**
 * Cache a profile for offline access
 */
export const cacheProfile = async (profileId: string, profileData: any): Promise<void> => {
  try {
    const db = await getDB();
    const now = Date.now();
    await db.put('profiles', {
      id: profileId,
      data: profileData,
      timestamp: now,
      expiresAt: now + CACHE_DURATION
    });
    cacheLogger.debug(`Cached profile: ${profileId}`);
  } catch (error) {
    cacheLogger.error('Failed to cache profile:', error);
  }
};

/**
 * Get a cached profile
 */
export const getCachedProfile = async (profileId: string): Promise<{ data: any; timestamp: number } | null> => {
  try {
    const db = await getDB();
    const cached = await db.get('profiles', profileId);

    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      cacheLogger.debug(`Cached profile expired: ${profileId}`);
      await db.delete('profiles', profileId);
      return null;
    }

    cacheLogger.debug(`Retrieved cached profile: ${profileId}`);
    return {
      data: cached.data,
      timestamp: cached.timestamp
    };
  } catch (error) {
    cacheLogger.error('Failed to get cached profile:', error);
    return null;
  }
};

/**
 * Cache a review for offline access
 */
export const cacheReview = async (reviewId: string, reviewData: any): Promise<void> => {
  try {
    const db = await getDB();
    const now = Date.now();
    await db.put('reviews', {
      id: reviewId,
      data: reviewData,
      timestamp: now,
      expiresAt: now + CACHE_DURATION
    });
    cacheLogger.debug(`Cached review: ${reviewId}`);
  } catch (error) {
    cacheLogger.error('Failed to cache review:', error);
  }
};

/**
 * Get a cached review
 */
export const getCachedReview = async (reviewId: string): Promise<{ data: any; timestamp: number } | null> => {
  try {
    const db = await getDB();
    const cached = await db.get('reviews', reviewId);

    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      cacheLogger.debug(`Cached review expired: ${reviewId}`);
      await db.delete('reviews', reviewId);
      return null;
    }

    cacheLogger.debug(`Retrieved cached review: ${reviewId}`);
    return {
      data: cached.data,
      timestamp: cached.timestamp
    };
  } catch (error) {
    cacheLogger.error('Failed to get cached review:', error);
    return null;
  }
};

/**
 * Clear all cached data
 */
export const clearCache = async (): Promise<void> => {
  try {
    const db = await getDB();
    await db.clear('profiles');
    await db.clear('reviews');
    cacheLogger.debug('Cache cleared');
  } catch (error) {
    cacheLogger.error('Failed to clear cache:', error);
  }
};

/**
 * Remove expired cache entries
 */
export const cleanExpiredCache = async (): Promise<void> => {
  try {
    const db = await getDB();
    const now = Date.now();

    // Clean expired profiles
    const profiles = await db.getAll('profiles');
    for (const profile of profiles) {
      if (now > profile.expiresAt) {
        await db.delete('profiles', profile.id);
      }
    }

    // Clean expired reviews
    const reviews = await db.getAll('reviews');
    for (const review of reviews) {
      if (now > review.expiresAt) {
        await db.delete('reviews', review.id);
      }
    }

    cacheLogger.debug('Expired cache entries cleaned');
  } catch (error) {
    cacheLogger.error('Failed to clean expired cache:', error);
  }
};

/**
 * Check if device is online
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Format timestamp for display
 */
export const formatCacheTimestamp = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};
