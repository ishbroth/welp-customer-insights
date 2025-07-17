
import { useState, useCallback } from 'react';
import { sanitizeHtml, escapeHtml } from '@/utils/securityHelpers';

/**
 * Hook for handling secure user input with automatic sanitization
 */
export const useSecureInput = (initialValue: string = '') => {
  const [value, setValue] = useState(initialValue);
  const [sanitizedValue, setSanitizedValue] = useState(sanitizeHtml(initialValue));

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    setSanitizedValue(sanitizeHtml(newValue));
  }, []);

  const getEscapedValue = useCallback(() => {
    return escapeHtml(value);
  }, [value]);

  const reset = useCallback(() => {
    setValue('');
    setSanitizedValue('');
  }, []);

  return {
    value,
    sanitizedValue,
    handleChange,
    getEscapedValue,
    reset
  };
};
