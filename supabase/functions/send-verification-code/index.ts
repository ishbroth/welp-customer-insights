
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
    const { phoneNumber } = await req.json()
    console.log('📱 Received verification request for:', phoneNumber)

    // Format phone number to E.164 format
    const cleanedPhone = phoneNumber.replace(/\D/g, '')
    const formattedPhone = cleanedPhone.startsWith('1') ? `+${cleanedPhone}` : `+1${cleanedPhone}`
    console.log('📱 Formatted phone number:', formattedPhone)

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    console.log('🔢 Generated verification code:', verificationCode)

    // Store verification code in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // First, delete any existing codes for this phone number
    const { error: deleteError } = await supabase
      .from('verification_codes')
      .delete()
      .eq('phone', formattedPhone)

    if (deleteError) {
      console.error('⚠️ Warning: Could not delete existing codes:', deleteError)
      // Continue anyway, as this might not be critical
    }

    // Insert new verification code
    const { error: dbError } = await supabase
      .from('verification_codes')
      .insert({
        phone: formattedPhone,
        code: verificationCode,
        expires_at: expiresAt.toISOString()
      })

    if (dbError) {
      console.error('❌ Database error:', dbError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Database error: ${dbError.message}`,
          debug: { phone: formattedPhone, error: dbError }
        }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    console.log('✅ Verification code stored in database')

    // Check if AWS credentials are configured
    const awsAccessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID')
    const awsSecretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')
    const awsRegion = Deno.env.get('AWS_REGION') || 'us-east-1'
    const originationNumber = Deno.env.get('AWS_SNS_ORIGINATION_NUMBER')

    if (!awsAccessKeyId || !awsSecretAccessKey || !originationNumber) {
      console.error('❌ Missing AWS credentials or origination number')
      console.error('AWS_ACCESS_KEY_ID:', awsAccessKeyId ? 'SET' : 'MISSING')
      console.error('AWS_SECRET_ACCESS_KEY:', awsSecretAccessKey ? 'SET' : 'MISSING')
      console.error('AWS_SNS_ORIGINATION_NUMBER:', originationNumber ? 'SET' : 'MISSING')
      
      // Return success for testing but log the issue
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Verification code stored (SMS not sent - AWS not configured)',
          debug: {
            phone: formattedPhone,
            code: verificationCode, // Include for testing
            awsConfigured: false
          }
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    console.log('📤 Sending SMS via AWS SNS...')

    // Create the message
    const message = `Your Welp verification code is: ${verificationCode}. This code expires in 10 minutes.`
    
    // Prepare AWS SNS request
    const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '')
    const date = timestamp.substr(0, 8)
    const service = 'sns'
    const region = awsRegion
    const host = `${service}.${region}.amazonaws.com`
    const endpoint = `https://${host}/`

    // Create request body for SNS
    const params = new URLSearchParams({
      'Action': 'Publish',
      'PhoneNumber': formattedPhone,
      'Message': message,
      'MessageAttributes.AWS.SNS.SMS.SenderID.DataType': 'String',
      'MessageAttributes.AWS.SNS.SMS.SenderID.StringValue': 'Welp',
      'MessageAttributes.AWS.SNS.SMS.SMSType.DataType': 'String',
      'MessageAttributes.AWS.SNS.SMS.SMSType.StringValue': 'Transactional',
      'Version': '2010-03-31'
    })

    const payloadString = params.toString()
    console.log('📦 SNS payload prepared')

    // Create AWS signature v4
    const payloadHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payloadString))
      .then(hash => Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''))

    const canonicalHeaders = `host:${host}\nx-amz-date:${timestamp}\n`
    const signedHeaders = 'host;x-amz-date'
    
    const canonicalRequest = [
      'POST',
      '/',
      '',
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join('\n')

    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256'
    const credentialScope = `${date}/${region}/${service}/aws4_request`
    const canonicalRequestHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest))
      .then(hash => Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''))
    
    const stringToSign = [
      algorithm,
      timestamp,
      credentialScope,
      canonicalRequestHash
    ].join('\n')

    // Calculate signature
    const getSignatureKey = async (key: string, dateStamp: string, regionName: string, serviceName: string) => {
      const kDate = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode('AWS4' + key),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ).then(k => crypto.subtle.sign('HMAC', k, new TextEncoder().encode(dateStamp)))

      const kRegion = await crypto.subtle.importKey(
        'raw',
        new Uint8Array(kDate),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ).then(k => crypto.subtle.sign('HMAC', k, new TextEncoder().encode(regionName)))

      const kService = await crypto.subtle.importKey(
        'raw',
        new Uint8Array(kRegion),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ).then(k => crypto.subtle.sign('HMAC', k, new TextEncoder().encode(serviceName)))

      return await crypto.subtle.importKey(
        'raw',
        new Uint8Array(kService),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ).then(k => crypto.subtle.sign('HMAC', k, new TextEncoder().encode('aws4_request')))
    }

    const signingKey = await getSignatureKey(awsSecretAccessKey, date, region, service)
    const signature = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(signingKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(k => crypto.subtle.sign('HMAC', k, new TextEncoder().encode(stringToSign)))
    .then(sig => Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join(''))

    // Create authorization header
    const authorizationHeader = `${algorithm} Credential=${awsAccessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

    // Send request to AWS SNS
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authorizationHeader,
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'X-Amz-Date': timestamp,
        'Host': host
      },
      body: payloadString
    })

    const responseText = await response.text()
    console.log('📱 AWS SNS Response Status:', response.status)
    console.log('📱 AWS SNS Response:', responseText)

    if (!response.ok) {
      console.error('❌ AWS SNS Error:', responseText)
      // Still return success since code is stored, but log the SMS failure
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Verification code stored (SMS send failed)',
          debug: {
            phone: formattedPhone,
            code: verificationCode, // Include for testing
            awsError: responseText,
            awsStatus: response.status
          }
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    console.log('✅ SMS sent successfully via AWS SNS')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification code sent successfully',
        debug: {
          phone: formattedPhone,
          awsConfigured: true
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('❌ Error in send-verification-code function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send verification code',
        debug: {
          timestamp: new Date().toISOString(),
          errorStack: error.stack
        }
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
