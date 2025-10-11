/**
 * Logger Utility Test
 * 
 * This file demonstrates and tests the logger utility.
 * You can run this in the browser console to verify functionality.
 * 
 * To test:
 * 1. Import this in a component temporarily
 * 2. Check browser console for output
 * 3. Verify log levels appear correctly based on environment
 */

import { logger } from './logger';

export const testLogger = () => {
  console.log('=== Logger Utility Test ===');
  console.log('Environment:', import.meta.env.MODE);
  console.log('Configuration:', logger.getConfig());
  console.log('');

  // Test basic logging
  console.log('--- Testing Basic Log Levels ---');
  logger.debug('This is a debug message', { detail: 'Only in development' });
  logger.info('This is an info message', { detail: 'Only in development' });
  logger.warn('This is a warning message', { detail: 'Always visible' });
  logger.error('This is an error message', { detail: 'Always visible' });
  console.log('');

  // Test with error object
  console.log('--- Testing Error Logging ---');
  const testError = new Error('Test error object');
  logger.error('Testing error with Error object', testError);
  console.log('');

  // Test context loggers
  console.log('--- Testing Context Loggers ---');
  const authLogger = logger.withContext('Auth');
  const reviewLogger = logger.withContext('Reviews');
  
  authLogger.debug('Auth debug message');
  authLogger.info('Auth info message');
  authLogger.warn('Auth warning message');
  authLogger.error('Auth error message');
  
  reviewLogger.debug('Review debug message');
  reviewLogger.info('Review info message');
  console.log('');

  // Test with complex data
  console.log('--- Testing with Complex Data ---');
  logger.info('User action', {
    userId: '12345',
    action: 'submit_review',
    timestamp: new Date().toISOString(),
    metadata: {
      rating: 5,
      hasPhotos: true
    }
  });
  console.log('');

  console.log('=== Test Complete ===');
  console.log('Expected behavior:');
  console.log('- Development: All log levels visible');
  console.log('- Production: Only WARN and ERROR visible');
};

// Uncomment to run test automatically
// testLogger();
