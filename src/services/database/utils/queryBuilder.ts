/**
 * Reusable query patterns and utilities
 */
import type { QueryOptions } from '../types';

export class QueryBuilder {
  /**
   * Build pagination parameters
   */
  static paginate(page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;
    return {
      from: offset,
      to: offset + pageSize - 1
    };
  }

  /**
   * Build order by clause
   */
  static orderBy(column: string, ascending: boolean = false) {
    return { column, ascending };
  }

  /**
   * Build full-text search query
   */
  static fullTextSearch(column: string, searchTerm: string) {
    return `${column}.fts.${searchTerm}`;
  }

  /**
   * Build ILIKE search (case-insensitive partial match)
   */
  static ilike(column: string, searchTerm: string) {
    return `${column}.ilike.%${searchTerm}%`;
  }

  /**
   * Build OR condition for multiple columns
   */
  static orSearch(searches: Array<{ column: string; term: string }>) {
    return searches
      .map(s => `${s.column}.ilike.%${s.term}%`)
      .join(',');
  }

  /**
   * Apply standard query options to a query
   */
  static applyOptions<T>(query: any, options: QueryOptions) {
    let modifiedQuery = query;

    if (options.limit) {
      modifiedQuery = modifiedQuery.limit(options.limit);
    }

    if (options.offset) {
      modifiedQuery = modifiedQuery.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      );
    }

    if (options.orderBy) {
      modifiedQuery = modifiedQuery.order(
        options.orderBy.column,
        { ascending: options.orderBy.ascending ?? false }
      );
    }

    return modifiedQuery;
  }
}
