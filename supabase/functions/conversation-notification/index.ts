import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  reviewId: string;
  messageId: string;
  authorId: string;
  authorType: 'business' | 'customer';
  content: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { reviewId, messageId, authorId, authorType, content }: NotificationRequest = await req.json();

    console.log('Processing conversation notification:', { reviewId, messageId, authorId, authorType });

    // Get conversation participants
    const { data: participants, error: participantsError } = await supabase
      .from('conversation_participants')
      .select('customer_id, business_id')
      .eq('review_id', reviewId)
      .single();

    if (participantsError || !participants) {
      console.error('Error fetching participants:', participantsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch conversation participants' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine who to notify (the other participant)
    const recipientId = authorType === 'customer' ? participants.business_id : participants.customer_id;
    const recipientType = authorType === 'customer' ? 'business' : 'customer';

    console.log('Notifying recipient:', { recipientId, recipientType });

    // Get recipient's notification preferences
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('review_responses, push_notifications, email_notifications')
      .eq('user_id', recipientId)
      .single();

    // If no preferences found or notifications disabled, skip
    if (!preferences || !preferences.review_responses) {
      console.log('Notifications disabled for user:', recipientId);
      return new Response(
        JSON.stringify({ message: 'Notifications disabled for recipient' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get author profile for notification content
    const { data: authorProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name, name, type')
      .eq('id', authorId)
      .single();

    let authorName = 'Someone';
    if (authorProfile) {
      if (authorProfile.type === 'business') {
        // Get business name
        const { data: businessInfo } = await supabase
          .from('business_info')
          .select('business_name')
          .eq('id', authorId)
          .single();
        authorName = businessInfo?.business_name || `${authorProfile.first_name} ${authorProfile.last_name}`.trim() || 'Business';
      } else {
        authorName = `${authorProfile.first_name} ${authorProfile.last_name}`.trim() || authorProfile.name || 'Customer';
      }
    }

    // Create notification content
    const notificationTitle = `New response from ${authorName}`;
    const notificationContent = `${authorName} responded to a review conversation: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`;

    // Send push notification if enabled
    if (preferences.push_notifications) {
      try {
        // Get device tokens for the recipient
        const { data: deviceTokens } = await supabase
          .from('device_tokens')
          .select('token, platform')
          .eq('user_id', recipientId);

        if (deviceTokens && deviceTokens.length > 0) {
          console.log(`Sending push notifications to ${deviceTokens.length} devices`);
          
          // Call the send-push-notification edge function
          const { error: pushError } = await supabase.functions.invoke('send-push-notification', {
            body: {
              userIds: [recipientId],
              title: notificationTitle,
              body: notificationContent,
              data: {
                type: 'conversation_response',
                reviewId: reviewId,
                messageId: messageId,
                authorId: authorId
              }
            }
          });

          if (pushError) {
            console.error('Error sending push notification:', pushError);
          }
        }
      } catch (pushError) {
        console.error('Error processing push notification:', pushError);
      }
    }

    // Log the notification
    await supabase
      .from('notifications_log')
      .insert({
        user_id: recipientId,
        notification_type: 'conversation_response',
        channel: 'push',
        subject: notificationTitle,
        content: notificationContent,
        status: 'sent'
      });

    console.log('Conversation notification processed successfully');

    return new Response(
      JSON.stringify({ 
        message: 'Notification sent successfully',
        recipientId,
        authorName
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in conversation-notification function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});