import { useState, useEffect } from 'react';
import {
  isOnline,
  getCachedProfile,
  cacheProfile,
  getCachedReview,
  cacheReview,
  formatCacheTimestamp,
  cleanExpiredCache
} from '@/utils/offlineCache';

/**
 * Hook for managing offline caching
 * Provides utilities for caching and retrieving data when offline
 */
export const useOfflineCache = () => {
  const [online, setOnline] = useState(isOnline());
  const [cacheInfo, setCacheInfo] = useState<{ timestamp?: number; isFromCache: boolean }>({
    isFromCache: false
  });

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Back online');
      setOnline(true);
    };

    const handleOffline = () => {
      console.log('📴 Went offline');
      setOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean expired cache on mount
    cleanExpiredCache();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Fetch profile with offline caching
   * Returns cached data if offline, otherwise fetches fresh data and caches it
   */
  const fetchProfileWithCache = async <T,>(
    profileId: string,
    fetchFn: () => Promise<T>
  ): Promise<{ data: T | null; isFromCache: boolean; cacheTimestamp?: number }> => {
    // If offline, return cached data
    if (!online) {
      const cached = await getCachedProfile(profileId);
      if (cached) {
        setCacheInfo({ isFromCache: true, timestamp: cached.timestamp });
        return {
          data: cached.data as T,
          isFromCache: true,
          cacheTimestamp: cached.timestamp
        };
      }
      // No cached data available
      return { data: null, isFromCache: false };
    }

    // Online: fetch fresh data
    try {
      const data = await fetchFn();
      // Cache the fresh data for offline use
      await cacheProfile(profileId, data);
      setCacheInfo({ isFromCache: false });
      return { data, isFromCache: false };
    } catch (error) {
      // Fetch failed, try to return cached data as fallback
      console.error('Fetch failed, trying cache:', error);
      const cached = await getCachedProfile(profileId);
      if (cached) {
        setCacheInfo({ isFromCache: true, timestamp: cached.timestamp });
        return {
          data: cached.data as T,
          isFromCache: true,
          cacheTimestamp: cached.timestamp
        };
      }
      throw error;
    }
  };

  /**
   * Fetch review with offline caching
   */
  const fetchReviewWithCache = async <T,>(
    reviewId: string,
    fetchFn: () => Promise<T>
  ): Promise<{ data: T | null; isFromCache: boolean; cacheTimestamp?: number }> => {
    // If offline, return cached data
    if (!online) {
      const cached = await getCachedReview(reviewId);
      if (cached) {
        setCacheInfo({ isFromCache: true, timestamp: cached.timestamp });
        return {
          data: cached.data as T,
          isFromCache: true,
          cacheTimestamp: cached.timestamp
        };
      }
      return { data: null, isFromCache: false };
    }

    // Online: fetch fresh data
    try {
      const data = await fetchFn();
      // Cache the fresh data
      await cacheReview(reviewId, data);
      setCacheInfo({ isFromCache: false });
      return { data, isFromCache: false };
    } catch (error) {
      // Fetch failed, try cache
      console.error('Fetch failed, trying cache:', error);
      const cached = await getCachedReview(reviewId);
      if (cached) {
        setCacheInfo({ isFromCache: true, timestamp: cached.timestamp });
        return {
          data: cached.data as T,
          isFromCache: true,
          cacheTimestamp: cached.timestamp
        };
      }
      throw error;
    }
  };

  return {
    isOnline: online,
    isFromCache: cacheInfo.isFromCache,
    cacheTimestamp: cacheInfo.timestamp,
    cacheAge: cacheInfo.timestamp ? formatCacheTimestamp(cacheInfo.timestamp) : undefined,
    fetchProfileWithCache,
    fetchReviewWithCache
  };
};
