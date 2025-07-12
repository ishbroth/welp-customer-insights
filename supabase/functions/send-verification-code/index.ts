
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

    const { error: dbError } = await supabase
      .from('verification_codes')
      .insert({
        phone: formattedPhone,
        code: verificationCode,
        expires_at: expiresAt.toISOString()
      })

    if (dbError) {
      console.error('❌ Database error:', dbError)
      throw new Error('Failed to store verification code')
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
    const message = `Your Welp verification code is: ${verificationCode}`
    
    // Use AWS SDK v3 style request
    const snsPayload = {
      Message: message,
      PhoneNumber: formattedPhone,
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: 'Welp'
        },
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String', 
          StringValue: 'Transactional'
        }
      }
    }

    // Create AWS signature
    const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '')
    const date = timestamp.substr(0, 8)
    const service = 'sns'
    const region = awsRegion
    const host = `${service}.${region}.amazonaws.com`
    const endpoint = `https://${host}/`

    // Create canonical request for AWS Signature v4
    const payloadString = JSON.stringify(snsPayload)
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
        'Content-Type': 'application/x-amz-json-1.0',
        'X-Amz-Date': timestamp,
        'X-Amz-Target': 'AmazonSNS.Publish'
      },
      body: payloadString
    })

    const responseText = await response.text()
    console.log('📱 AWS SNS Response Status:', response.status)
    console.log('📱 AWS SNS Response:', responseText)

    if (!response.ok) {
      console.error('❌ AWS SNS Error:', responseText)
      throw new Error(`AWS SNS API error: ${response.status} - ${responseText}`)
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
        error: error.message || 'Failed to send verification code' 
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
