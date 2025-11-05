import { isNativeApp } from './platform';
import { logger } from './logger';

const storageLogger = logger.withContext('AuthStorage');

// Key for storing saved credentials (for autofill)
const SAVED_CREDENTIALS_KEY = 'welp_saved_credentials';

// Key for remember me preference
const REMEMBER_ME_KEY = 'welp_remember_me';

/**
 * Get the remember me preference from storage
 */
export const getRememberMePreference = (): boolean => {
  try {
    const value = localStorage.getItem(REMEMBER_ME_KEY);
    return value === 'true';
  } catch (error) {
    storageLogger.error('Error getting remember me preference:', error);
    return false;
  }
};

/**
 * Set the remember me preference in storage
 */
export const setRememberMePreference = (value: boolean): void => {
  try {
    localStorage.setItem(REMEMBER_ME_KEY, value.toString());
    storageLogger.debug('Remember me preference set to:', value);
  } catch (error) {
    storageLogger.error('Error setting remember me preference:', error);
  }
};

/**
 * Save user credentials for autofill (only when Remember Me is checked)
 */
export const saveCredentials = (email: string, password: string): void => {
  try {
    const credentials = { email, password };
    localStorage.setItem(SAVED_CREDENTIALS_KEY, JSON.stringify(credentials));
    storageLogger.debug('Credentials saved for autofill');
  } catch (error) {
    storageLogger.error('Error saving credentials:', error);
  }
};

/**
 * Get saved credentials for autofill
 */
export const getSavedCredentials = (): { email: string; password: string } | null => {
  try {
    const value = localStorage.getItem(SAVED_CREDENTIALS_KEY);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    storageLogger.error('Error getting saved credentials:', error);
    return null;
  }
};

/**
 * Clear saved credentials (on logout or when Remember Me is unchecked)
 */
export const clearSavedCredentials = (): void => {
  try {
    localStorage.removeItem(SAVED_CREDENTIALS_KEY);
    storageLogger.debug('Saved credentials cleared');
  } catch (error) {
    storageLogger.error('Error clearing saved credentials:', error);
  }
};

/**
 * Custom storage adapter for Supabase auth
 * Handles different storage strategies based on platform and remember me preference
 */
export const createAuthStorageAdapter = () => {
  // For native apps, always use localStorage (persistent)
  if (isNativeApp()) {
    storageLogger.debug('Using localStorage for native app');
    return {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          storageLogger.error('Error getting item from localStorage:', error);
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          storageLogger.error('Error setting item in localStorage:', error);
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          storageLogger.error('Error removing item from localStorage:', error);
        }
      },
    };
  }

  // For web browsers, use sessionStorage (clears on browser close)
  // This applies regardless of Remember Me setting - session always clears on browser close
  // Remember Me only affects credential autofill, not session persistence
  storageLogger.debug('Using sessionStorage for web browser');
  return {
    getItem: (key: string) => {
      try {
        return sessionStorage.getItem(key);
      } catch (error) {
        storageLogger.error('Error getting item from sessionStorage:', error);
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        sessionStorage.setItem(key, value);
      } catch (error) {
        storageLogger.error('Error setting item in sessionStorage:', error);
      }
    },
    removeItem: (key: string) => {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        storageLogger.error('Error removing item from sessionStorage:', error);
      }
    },
  };
};
