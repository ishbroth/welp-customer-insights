import { db } from '../client';
import { QueryBuilder } from '../utils/queryBuilder';
import type { Review, InsertReview, UpdateReview, QueryOptions, PaginationResult } from '../types';
import { logger } from '@/utils/logger';
import { DatabaseError } from '../errors';

const reviewLogger = logger.withContext('ReviewsService');

export class ReviewsService {
  /**
   * Get a single review by ID
   */
  async getById(reviewId: string): Promise<Review> {
    return db.query<Review>('getReviewById', async () => {
      return await db.getClient()
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single();
    });
  }

  /**
   * Get reviews written by a business
   */
  async getByBusinessId(
    businessId: string,
    options: QueryOptions = {}
  ): Promise<PaginationResult<Review>> {
    const { limit = 10, offset = 0 } = options;

    reviewLogger.debug('Fetching reviews by business ID', { businessId, limit, offset });

    let query = db.getClient()
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('business_id', businessId);

    // Apply query options
    query = QueryBuilder.applyOptions(query, options);

    const { data, error, count } = await query;

    if (error) {
      throw new DatabaseError('getReviewsByBusinessId', error);
    }

    return {
      data: data || [],
      count: count || 0,
      hasMore: (count || 0) > offset + limit
    };
  }

  /**
   * Get reviews about a customer (by phone number)
   */
  async getByCustomerPhone(
    customerPhone: string,
    options: QueryOptions = {}
  ): Promise<PaginationResult<Review>> {
    const { limit = 10, offset = 0 } = options;

    reviewLogger.debug('Fetching reviews by customer phone', { customerPhone, limit, offset });

    let query = db.getClient()
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('customer_phone', customerPhone);

    query = QueryBuilder.applyOptions(query, options);

    const { data, error, count } = await query;

    if (error) {
      throw new DatabaseError('getReviewsByCustomerPhone', error);
    }

    return {
      data: data || [],
      count: count || 0,
      hasMore: (count || 0) > offset + limit
    };
  }

  /**
   * Search reviews by customer name, phone, or business name
   */
  async search(
    searchTerm: string,
    options: QueryOptions = {}
  ): Promise<Review[]> {
    const { limit = 50 } = options;

    reviewLogger.debug('Searching reviews', { searchTerm, limit });

    const searchQuery = QueryBuilder.orSearch([
      { column: 'customer_name', term: searchTerm },
      { column: 'customer_phone', term: searchTerm },
      { column: 'customer_business_name', term: searchTerm }
    ]);

    return db.queryList<Review>('searchReviews', async () => {
      let query = db.getClient()
        .from('reviews')
        .select('*')
        .or(searchQuery);

      query = QueryBuilder.applyOptions(query, options);

      return await query;
    });
  }

  /**
   * Create a new review
   */
  async create(reviewData: InsertReview): Promise<Review> {
    reviewLogger.info('Creating new review', {
      businessId: reviewData.business_id,
      customerName: reviewData.customer_name
    });

    return db.query<Review>('createReview', async () => {
      return await db.getClient()
        .from('reviews')
        .insert(reviewData)
        .select()
        .single();
    });
  }

  /**
   * Update an existing review
   */
  async update(reviewId: string, updates: UpdateReview): Promise<Review> {
    reviewLogger.info('Updating review', { reviewId });

    return db.query<Review>('updateReview', async () => {
      return await db.getClient()
        .from('reviews')
        .update(updates)
        .eq('id', reviewId)
        .select()
        .single();
    });
  }

  /**
   * Delete a review (soft delete)
   */
  async delete(reviewId: string): Promise<void> {
    reviewLogger.warn('Deleting review', { reviewId });

    await db.query('deleteReview', async () => {
      return await db.getClient()
        .from('reviews')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', reviewId);
    });
  }

  /**
   * Get reviews with pagination and filtering
   */
  async list(options: QueryOptions & {
    businessId?: string;
    customerPhone?: string;
    includeDeleted?: boolean;
  } = {}): Promise<PaginationResult<Review>> {
    const {
      limit = 10,
      offset = 0,
      businessId,
      customerPhone,
      includeDeleted = false
    } = options;

    let query = db.getClient()
      .from('reviews')
      .select('*', { count: 'exact' });

    // Apply filters
    if (businessId) {
      query = query.eq('business_id', businessId);
    }
    if (customerPhone) {
      query = query.eq('customer_phone', customerPhone);
    }
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    // Apply pagination and ordering
    query = QueryBuilder.applyOptions(query, options);

    const { data, error, count } = await query;

    if (error) {
      throw new DatabaseError('listReviews', error);
    }

    return {
      data: data || [],
      count: count || 0,
      hasMore: (count || 0) > offset + limit
    };
  }
}

// Export singleton instance
export const reviewsService = new ReviewsService();
