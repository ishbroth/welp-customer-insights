import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

const requestLogger = logger.withContext('ReviewRequestsService');

export interface ReviewRequest {
  id: string;
  customer_id: string;
  business_email: string;
  business_id: string | null;
  business_name: string | null;
  sent_at: string;
  created_at: string;
  updated_at: string;
}

export interface SendReviewRequestParams {
  businessEmail: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerId: string;
}

export interface ReviewRequestHistoryParams {
  customerId: string;
  page: number;
  pageSize?: number;
}

export interface ReviewRequestHistoryResult {
  requests: ReviewRequest[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class ReviewRequestsService {
  /**
   * Send a review request to a business
   */
  async sendReviewRequest(params: SendReviewRequestParams): Promise<{
    success: boolean;
    message: string;
    isExistingBusiness?: boolean;
    error?: string;
  }> {
    try {
      requestLogger.info('Sending review request', {
        businessEmail: params.businessEmail,
        customerId: params.customerId,
      });

      const { data, error } = await supabase.functions.invoke('send-review-request', {
        body: {
          businessEmail: params.businessEmail,
          customerEmail: params.customerEmail,
          customerFirstName: params.customerFirstName,
          customerLastName: params.customerLastName,
          customerId: params.customerId,
        },
      });

      if (error) {
        requestLogger.error('Error sending review request', error);
        throw error;
      }

      if (data.error) {
        return {
          success: false,
          message: data.error,
          error: data.error,
        };
      }

      requestLogger.info('Review request sent successfully', data);

      return {
        success: true,
        message: data.message || 'Review request sent successfully',
        isExistingBusiness: data.isExistingBusiness,
      };
    } catch (error: any) {
      requestLogger.error('Failed to send review request', error);
      return {
        success: false,
        message: error.message || 'Failed to send review request',
        error: error.message,
      };
    }
  }

  /**
   * Get paginated review request history for a customer
   */
  async getRequestHistory(
    params: ReviewRequestHistoryParams
  ): Promise<ReviewRequestHistoryResult> {
    const pageSize = params.pageSize || 10;
    const offset = (params.page - 1) * pageSize;

    try {
      requestLogger.debug('Fetching request history', {
        customerId: params.customerId,
        page: params.page,
        pageSize,
      });

      // Get total count
      const { count, error: countError } = await supabase
        .from('review_requests')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', params.customerId);

      if (countError) {
        requestLogger.error('Error fetching request count', countError);
        throw countError;
      }

      // Get paginated requests
      const { data: requests, error: requestsError } = await supabase
        .from('review_requests')
        .select('*')
        .eq('customer_id', params.customerId)
        .order('sent_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (requestsError) {
        requestLogger.error('Error fetching requests', requestsError);
        throw requestsError;
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        requests: requests || [],
        total,
        page: params.page,
        pageSize,
        totalPages,
      };
    } catch (error: any) {
      requestLogger.error('Failed to fetch request history', error);
      throw error;
    }
  }

  /**
   * Check if customer can request a review from a business (30-day cooldown)
   */
  async canRequestReview(customerId: string, businessEmail: string): Promise<{
    canRequest: boolean;
    message?: string;
    lastRequestDate?: string;
  }> {
    try {
      // Check for requests within last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: existingRequest, error } = await supabase
        .from('review_requests')
        .select('sent_at')
        .eq('customer_id', customerId)
        .eq('business_email', businessEmail.toLowerCase())
        .gte('sent_at', thirtyDaysAgo.toISOString())
        .order('sent_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is OK
        requestLogger.error('Error checking request eligibility', error);
        throw error;
      }

      if (existingRequest) {
        const lastRequestDate = new Date(existingRequest.sent_at);
        const daysSinceRequest = Math.floor(
          (Date.now() - lastRequestDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const daysRemaining = 30 - daysSinceRequest;

        return {
          canRequest: false,
          message: `You've already requested a review from this business. You can request again in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}.`,
          lastRequestDate: existingRequest.sent_at,
        };
      }

      return {
        canRequest: true,
      };
    } catch (error: any) {
      requestLogger.error('Failed to check request eligibility', error);
      throw error;
    }
  }
}

export const reviewRequestsService = new ReviewRequestsService();
