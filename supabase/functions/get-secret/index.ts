
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { secretName } = await req.json()
    
    if (!secretName) {
      return new Response(
        JSON.stringify({ error: 'Secret name is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Retrieving secret: ${secretName}`)

    // Try to get the secret from Supabase Vault using the correct schema
    const { data, error } = await supabase
      .schema('vault')
      .from('secrets')
      .select('secret')
      .eq('name', secretName)
      .single()

    if (error) {
      console.error('Error retrieving secret from vault:', error)
      
      // Fallback: try to get from environment variables directly
      const envValue = Deno.env.get(secretName)
      if (envValue) {
        console.log('Found secret in environment variables')
        return new Response(
          JSON.stringify({ secret: envValue }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      return new Response(
        JSON.stringify({ error: 'Secret not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!data?.secret) {
      console.log('Secret not found in vault')
      
      // Fallback: try to get from environment variables directly
      const envValue = Deno.env.get(secretName)
      if (envValue) {
        console.log('Found secret in environment variables')
        return new Response(
          JSON.stringify({ secret: envValue }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      return new Response(
        JSON.stringify({ error: 'Secret not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Secret retrieved successfully from vault')
    
    return new Response(
      JSON.stringify({ secret: data.secret }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in get-secret function:', error)
    
    // Final fallback: try environment variable
    try {
      const { secretName } = await req.json()
      const envValue = Deno.env.get(secretName)
      if (envValue) {
        console.log('Using environment variable fallback')
        return new Response(
          JSON.stringify({ secret: envValue }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError)
    }
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
