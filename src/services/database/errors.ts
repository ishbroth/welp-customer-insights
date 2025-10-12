/**
 * Custom database error classes for consistent error handling
 */

export class DatabaseError extends Error {
  constructor(
    public operation: string,
    public originalError: any
  ) {
    super(`Database operation failed: ${operation}`);
    this.name = 'DatabaseError';
  }
}

export class NotFoundError extends Error {
  constructor(public operation: string) {
    super(`Resource not found: ${operation}`);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(
    public field: string,
    public message: string
  ) {
    super(`Validation failed for ${field}: ${message}`);
    this.name = 'ValidationError';
  }
}

export class DuplicateError extends Error {
  constructor(
    public resource: string,
    public field: string
  ) {
    super(`Duplicate ${resource} found for ${field}`);
    this.name = 'DuplicateError';
  }
}

export class UnauthorizedError extends Error {
  constructor(public operation: string) {
    super(`Unauthorized: ${operation}`);
    this.name = 'UnauthorizedError';
  }
}
