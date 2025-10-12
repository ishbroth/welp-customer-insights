/**
 * Centralized Supabase client wrapper
 * Provides consistent error handling and logging
 */
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { DatabaseError, NotFoundError } from './errors';

const dbLogger = logger.withContext('Database');

export class DatabaseClient {
  private client = supabase;

  /**
   * Execute a query with standard error handling
   * Throws if data is null or error occurs
   */
  async query<T>(
    operation: string,
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<T> {
    dbLogger.debug(`Executing query: ${operation}`);

    try {
      const { data, error } = await queryFn();

      if (error) {
        dbLogger.error(`Query failed: ${operation}`, error);
        throw new DatabaseError(operation, error);
      }

      if (data === null) {
        dbLogger.warn(`No data found: ${operation}`);
        throw new NotFoundError(operation);
      }

      dbLogger.debug(`Query succeeded: ${operation}`);
      return data;
    } catch (error) {
      if (error instanceof DatabaseError || error instanceof NotFoundError) {
        throw error;
      }
      dbLogger.error(`Unexpected error in query: ${operation}`, error);
      throw new DatabaseError(operation, error);
    }
  }

  /**
   * Execute a query that might return null (optional data)
   * Does not throw if data is null
   */
  async queryOptional<T>(
    operation: string,
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<T | null> {
    dbLogger.debug(`Executing optional query: ${operation}`);

    const { data, error } = await queryFn();

    if (error) {
      dbLogger.error(`Query failed: ${operation}`, error);
      throw new DatabaseError(operation, error);
    }

    dbLogger.debug(`Optional query completed: ${operation}`, { foundData: data !== null });
    return data;
  }

  /**
   * Execute a query that returns an array
   * Returns empty array if no data
   */
  async queryList<T>(
    operation: string,
    queryFn: () => Promise<{ data: T[] | null; error: any }>
  ): Promise<T[]> {
    dbLogger.debug(`Executing list query: ${operation}`);

    const { data, error } = await queryFn();

    if (error) {
      dbLogger.error(`List query failed: ${operation}`, error);
      throw new DatabaseError(operation, error);
    }

    const result = data || [];
    dbLogger.debug(`List query completed: ${operation}`, { count: result.length });
    return result;
  }

  /**
   * Get direct access to Supabase client
   * Use sparingly - prefer service methods
   */
  getClient() {
    return this.client;
  }
}

// Export singleton instance
export const db = new DatabaseClient();
