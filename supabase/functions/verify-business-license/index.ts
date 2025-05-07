
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Main handler function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const body = await req.json();
    
    // Extract license information
    const { licenseNumber, businessName, state } = body;
    
    if (!licenseNumber || !businessName) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields. Please provide licenseNumber and businessName.'
        }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          }
        }
      );
    }
    
    // Here we would normally call an external business verification API
    // For this demo, we'll implement a more sophisticated mock
    // In a real app, you would replace this with API calls to services like:
    // - LexisNexis
    // - Dun & Bradstreet
    // - State business registries
    // - IRS EIN verification
    
    const verificationResult = await mockBusinessVerification(licenseNumber, businessName, state);
    
    return new Response(
      JSON.stringify(verificationResult),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  } catch (error) {
    console.error('Error processing business verification:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error during verification' }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});

// Mock business verification function that simulates API behavior
async function mockBusinessVerification(licenseNumber: string, businessName: string, state?: string) {
  // Simulate API response delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Common tax identification number formats
  const isFederalEIN = /^\d{2}-\d{7}$/.test(licenseNumber) || /^\d{9}$/.test(licenseNumber);
  
  // Common state license patterns (simplified)
  const isStateLicense = /^[A-Z]{2}-\d{6,10}$/.test(licenseNumber) || 
                         /^[A-Z]{3,6}-\d{4,8}$/.test(licenseNumber);
  
  // "Database" of business names that we'll consider valid matches
  const knownBusinessNames = [
    'Acme Construction', 
    'Acme Plumbing', 
    'Acme Enterprises',
    'Johnson Electrical',
    'Smith & Sons',
    'Quality Contractors'
  ];
  
  // Check if business name is a partial match for known names
  const nameMatchScore = knownBusinessNames.some(knownName => 
    businessName.toLowerCase().includes(knownName.toLowerCase().split(' ')[0]) ||
    knownName.toLowerCase().includes(businessName.toLowerCase().split(' ')[0])
  ) ? 0.8 : 0.2;
  
  // Calculate verification confidence score based on multiple factors
  let verificationScore = 0;
  
  // Add points for valid format
  if (isFederalEIN || isStateLicense) {
    verificationScore += 0.4;
  }
  
  // Add points for name match
  verificationScore += nameMatchScore;
  
  // Add points for state match if provided
  if (state && state.length === 2) {
    verificationScore += 0.2;
  }
  
  // Generate expiration date (1-3 years from now)
  const yearsValid = Math.floor(Math.random() * 3) + 1;
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + yearsValid);
  
  // Determine license type
  let licenseType = "Unknown";
  if (isFederalEIN) {
    licenseType = "Federal EIN";
  } else if (isStateLicense) {
    licenseType = state ? `${state} Business License` : "State Business License";
  } else if (licenseNumber.length > 6) {
    licenseType = "General Business License";
  }
  
  // Final verification result
  const isVerified = verificationScore >= 0.6;
  
  // Return detailed response
  return {
    verified: isVerified,
    confidenceScore: Math.min(verificationScore, 1).toFixed(2),
    licenseNumber,
    licenseType,
    licenseStatus: isVerified ? "Active" : "Unverified",
    licenseExpiration: expirationDate.toISOString().split('T')[0],
    businessName,
    verificationDetails: {
      nameMatchConfidence: nameMatchScore.toFixed(2),
      formatValid: isFederalEIN || isStateLicense
    }
  };
}
