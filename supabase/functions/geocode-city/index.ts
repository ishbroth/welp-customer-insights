import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { city, state } = await req.json()
    
    if (!city || !state) {
      return new Response(
        JSON.stringify({ error: 'City and state are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get Google Maps API key from environment
    const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    
    if (!googleMapsApiKey) {
      console.error('Google Maps API key not found')
      return new Response(
        JSON.stringify({ error: 'Geocoding service not available' }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Construct the address for geocoding
    const address = `${city}, ${state}, USA`
    const encodedAddress = encodeURIComponent(address)
    
    // Call Google Geocoding API
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${googleMapsApiKey}`
    
    console.log(`Geocoding request for: ${address}`)
    
    const response = await fetch(geocodeUrl)
    const data = await response.json()
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.log(`Geocoding failed for ${address}: ${data.status}`)
      return new Response(
        JSON.stringify({ error: 'Location not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Extract coordinates from the first result
    const location = data.results[0].geometry.location
    
    console.log(`Geocoded ${address}: ${location.lat}, ${location.lng}`)
    
    return new Response(
      JSON.stringify({
        coordinates: {
          lat: location.lat,
          lng: location.lng
        },
        formatted_address: data.results[0].formatted_address
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Geocoding error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})