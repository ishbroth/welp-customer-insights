
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushNotificationRequest {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, title, body, data }: PushNotificationRequest = await req.json()

    // Get device tokens for the user from database
    const { data: tokens, error: tokenError } = await Deno.env.get('SUPABASE_URL') 
      ? await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/device_tokens?user_id=eq.${userId}`, {
          headers: {
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          }
        }).then(res => res.json())
      : { data: null, error: 'No Supabase URL' }

    if (tokenError || !tokens || tokens.length === 0) {
      console.log('No device tokens found for user:', userId)
      return new Response(
        JSON.stringify({ message: 'No device tokens found' }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    // Send push notifications to all user devices
    const pushPromises = tokens.map(async (tokenData: any) => {
      const payload = {
        to: tokenData.token,
        title,
        body,
        data: data || {},
      }

      // Use Firebase Cloud Messaging or other push service
      // This is a simplified example - in production you'd use FCM SDK
      return fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
    })

    await Promise.all(pushPromises)

    return new Response(
      JSON.stringify({ message: 'Push notifications sent successfully' }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  } catch (error) {
    console.error('Error sending push notifications:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send push notifications' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  }
})
