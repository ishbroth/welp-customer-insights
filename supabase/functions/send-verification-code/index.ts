
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

    // Check AWS credentials
    const awsAccessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID')
    const awsSecretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')
    const awsRegion = Deno.env.get('AWS_REGION') || 'us-east-1'
    const originationNumber = Deno.env.get('AWS_SNS_ORIGINATION_NUMBER')

    console.log('🔍 AWS Configuration Check:')
    console.log('AWS_ACCESS_KEY_ID:', awsAccessKeyId ? `SET (${awsAccessKeyId.substring(0, 4)}...)` : 'MISSING')
    console.log('AWS_SECRET_ACCESS_KEY:', awsSecretAccessKey ? `SET (${awsSecretAccessKey.substring(0, 4)}...)` : 'MISSING')
    console.log('AWS_REGION:', awsRegion)
    console.log('AWS_SNS_ORIGINATION_NUMBER:', originationNumber ? `SET (${originationNumber})` : 'MISSING')

    if (!awsAccessKeyId || !awsSecretAccessKey || !originationNumber) {
      console.error('❌ Missing AWS credentials or origination number')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'AWS SMS configuration incomplete',
          message: 'Verification code stored but SMS cannot be sent',
          debug: {
            phone: formattedPhone,
            code: verificationCode,
            awsConfigured: false,
            missingConfig: {
              accessKey: !awsAccessKeyId,
              secretKey: !awsSecretAccessKey,
              region: !awsRegion,
              originationNumber: !originationNumber
            }
          }
        }),
        { 
          status: 200,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    console.log('📤 Attempting to send SMS via AWS SNS...')

    const message = `Your Welp verification code is: ${verificationCode}. This code expires in 10 minutes.`
    
    // Create AWS SNS payload - FIXED FORMAT
    const snsPayload = new URLSearchParams({
      'Action': 'Publish',
      'PhoneNumber': formattedPhone,
      'Message': message,
      'Version': '2010-03-31'
    })

    console.log('📦 SNS payload created')
    console.log('📦 Full payload being sent:', snsPayload.toString())

    // AWS signature v4 creation
    const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '')
    const date = timestamp.substr(0, 8)
    const service = 'sns'
    const region = awsRegion
    const host = `${service}.${region}.amazonaws.com`
    const endpoint = `https://${host}/`

    console.log('🔧 AWS Request Details:')
    console.log('Endpoint:', endpoint)
    console.log('Host:', host)
    console.log('Timestamp:', timestamp)
    console.log('Region:', region)

    // Create payload hash
    const payloadString = snsPayload.toString()
    const payloadHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payloadString))
      .then(hash => Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''))

    // Create canonical request
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

    console.log('🔐 Authorization header created')
    console.log('🚀 Sending request to AWS SNS...')
    
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
    console.log('📱 AWS SNS Response Headers:', Object.fromEntries(response.headers.entries()))
    console.log('📱 AWS SNS Response Body:', responseText)

    if (!response.ok) {
      console.error('❌ AWS SNS Error Details:')
      console.error('Status:', response.status)
      console.error('Status Text:', response.statusText)
      console.error('Response:', responseText)
      
      // Parse AWS error if possible
      let awsErrorDetails = 'Unknown AWS error'
      try {
        if (responseText.includes('<Code>') && responseText.includes('<Message>')) {
          const codeMatch = responseText.match(/<Code>(.*?)<\/Code>/)
          const messageMatch = responseText.match(/<Message>(.*?)<\/Message>/)
          if (codeMatch && messageMatch) {
            awsErrorDetails = `${codeMatch[1]}: ${messageMatch[1]}`
          }
        }
      } catch (parseError) {
        console.error('Could not parse AWS error:', parseError)
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'SMS send failed - AWS SNS error',
          message: 'Verification code stored but SMS send failed',
          debug: {
            phone: formattedPhone,
            code: verificationCode,
            awsConfigured: true,
            awsError: awsErrorDetails,
            awsStatus: response.status,
            awsStatusText: response.statusText,
            awsResponse: responseText.substring(0, 500),
            endpoint: endpoint,
            region: region,
            requestPayload: payloadString
          }
        }),
        { 
          status: 200,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    console.log('✅ SMS sent successfully via AWS SNS')
    
    // Parse success response to get message ID if available
    let messageId = null
    try {
      if (responseText.includes('<MessageId>')) {
        const messageIdMatch = responseText.match(/<MessageId>(.*?)<\/MessageId>/)
        if (messageIdMatch) {
          messageId = messageIdMatch[1]
          console.log('📱 AWS SNS Message ID:', messageId)
        }
      }
    } catch (parseError) {
      console.error('Could not parse message ID:', parseError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification code sent successfully',
        debug: {
          phone: formattedPhone,
          awsConfigured: true,
          awsRegion: region,
          messageId: messageId,
          awsResponse: responseText.substring(0, 200)
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
          errorType: error.constructor.name,
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
