import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeleteReviewRequest {
  reviewId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client with the user's auth token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('❌ User authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse the request body
    const { reviewId }: DeleteReviewRequest = await req.json();
    
    if (!reviewId) {
      console.error('❌ No reviewId provided');
      return new Response(
        JSON.stringify({ error: 'reviewId is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🗑️ Starting hard delete for review:', reviewId, 'by user:', user.id);

    // First, verify the user owns this review
    const { data: reviewData, error: reviewError } = await supabase
      .from('reviews')
      .select('id, business_id')
      .eq('id', reviewId)
      .eq('business_id', user.id)
      .single();

    if (reviewError || !reviewData) {
      console.error('❌ Review not found or unauthorized:', reviewError);
      return new Response(
        JSON.stringify({ error: 'Review not found or you do not have permission to delete it' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Review ownership verified, proceeding with hard delete...');

    // First, handle credit refunds for users who purchased access to this review
    console.log('💳 Processing credit refunds for users who purchased access...');
    try {
      // Find all users who paid credits to unlock this review
      const { data: creditTransactions, error: creditError } = await supabase
        .from('credit_transactions')
        .select('user_id, amount, description')
        .eq('type', 'usage')
        .like('description', `Unlocked review ${reviewId}%`);

      if (creditError) {
        console.error('❌ Error fetching credit transactions:', creditError);
      } else if (creditTransactions && creditTransactions.length > 0) {
        console.log(`🔍 Found ${creditTransactions.length} users who purchased access to this review`);
        
        // Refund each user who purchased access
        for (const transaction of creditTransactions) {
          try {
            // Refund the credit amount (make it positive since it was negative in usage)
            const refundAmount = Math.abs(transaction.amount);
            
            const { error: refundError } = await supabase.rpc('update_user_credits', {
              p_user_id: transaction.user_id,
              p_amount: refundAmount,
              p_type: 'refund',
              p_description: `Refund: Review deleted ${reviewId}`,
              p_stripe_session_id: null
            });

            if (refundError) {
              console.error('❌ Error refunding credits for user:', transaction.user_id, refundError);
            } else {
              console.log(`✅ Refunded ${refundAmount} credit(s) to user:`, transaction.user_id);
            }
          } catch (refundErr) {
            console.error('❌ Exception during refund for user:', transaction.user_id, refundErr);
          }
        }
        
        console.log('✅ Credit refund processing completed');
      } else {
        console.log('ℹ️ No users found who purchased access to this review');
      }
    } catch (error) {
      console.error('❌ Exception during credit refund processing:', error);
      // Continue with deletion even if refund fails
    }

    // Delete all associated data in order (foreign key dependencies)
    
    // 1. Delete review photos
    console.log('🗑️ Deleting review photos...');
    const { error: photosError } = await supabase
      .from('review_photos')
      .delete()
      .eq('review_id', reviewId);
    
    if (photosError) {
      console.error('❌ Error deleting review photos:', photosError);
    } else {
      console.log('✅ Review photos deleted');
    }

    // 2. Delete review reports
    console.log('🗑️ Deleting review reports...');
    const { error: reportsError } = await supabase
      .from('review_reports')
      .delete()
      .eq('review_id', reviewId);
    
    if (reportsError) {
      console.error('❌ Error deleting review reports:', reportsError);
    } else {
      console.log('✅ Review reports deleted');
    }

    // 3. Delete guest access records
    console.log('🗑️ Deleting guest access records...');
    const { error: guestAccessError } = await supabase
      .from('guest_access')
      .delete()
      .eq('review_id', reviewId);
    
    if (guestAccessError) {
      console.error('❌ Error deleting guest access:', guestAccessError);
    } else {
      console.log('✅ Guest access records deleted');
    }

    // 4. Delete user review notifications
    console.log('🗑️ Deleting user review notifications...');
    const { error: notificationsError } = await supabase
      .from('user_review_notifications')
      .delete()
      .eq('review_id', reviewId);
    
    if (notificationsError) {
      console.error('❌ Error deleting notifications:', notificationsError);
    } else {
      console.log('✅ User review notifications deleted');
    }

    // 5. Delete customer review associations
    console.log('🗑️ Deleting customer review associations...');
    const { error: associationsError } = await supabase
      .from('customer_review_associations')
      .delete()
      .eq('review_id', reviewId);
    
    if (associationsError) {
      console.error('❌ Error deleting associations:', associationsError);
    } else {
      console.log('✅ Customer review associations deleted');
    }

    // 6. Finally, delete the review itself
    console.log('🗑️ Deleting the review record...');
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('business_id', user.id); // Double-check ownership

    if (deleteError) {
      console.error('❌ Error deleting review:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete review' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Review and all associated data successfully deleted');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Review and all associated data deleted successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error in delete-review function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});