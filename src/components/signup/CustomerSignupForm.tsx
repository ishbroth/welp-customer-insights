import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { useToast } from "@/hooks/use-toast";
import { UserRound } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

// Array of US states for the dropdown
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", 
  "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", 
  "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

const CustomerSignupForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Customer form state
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerStreet, setCustomerStreet] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [customerZipCode, setCustomerZipCode] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [customerConfirmPassword, setCustomerConfirmPassword] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingEmailError, setExistingEmailError] = useState(false);

  const handleAddressSelect = (place: google.maps.places.PlaceResult) => {
    if (!place.address_components) return;

    // Extract address components
    let streetNumber = '';
    let route = '';
    let city = '';
    let state = '';
    let zipCode = '';

    place.address_components.forEach((component) => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      } else if (types.includes('route')) {
        route = component.long_name;
      } else if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name;
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name;
      }
    });

    // Update form fields
    if (city) setCustomerCity(city);
    if (state) setCustomerState(state);
    if (zipCode) setCustomerZipCode(zipCode);
  };
  
  // Email validation to check if it's already registered
  const checkEmailExists = async (email: string) => {
    try {
      // Check if the email already exists in auth
      const { error, data } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false
        }
      });
      
      // If there's no error when trying to send a one-time password to the email,
      // it means the email exists
      if (!error) {
        setExistingEmailError(true);
        return true;
      }
      
      // If error contains "Email not confirmed" or "Invalid login credentials", 
      // it means the email exists but password is wrong
      if (error.message.includes("Email not confirmed") || 
          error.message.includes("Invalid login credentials")) {
        setExistingEmailError(true);
        return true;
      }
      
      setExistingEmailError(false);
      return false;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };
  
  const handleCreateCustomerAccount = async () => {
    // Validate customer information
    if (
      !customerFirstName || 
      !customerLastName || 
      !customerPhone || 
      !customerEmail || 
      !customerPassword ||
      customerPassword !== customerConfirmPassword
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields and ensure passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First, check if email is already registered
      const emailExists = await checkEmailExists(customerEmail);
      
      if (emailExists) {
        setIsSubmitting(false);
        // No need for toast here as we'll show an inline error message
        return;
      }
      
      // Send verification code via Edge Function
      const { data, error } = await supabase.functions.invoke('verify-phone', {
        body: {
          phoneNumber: customerPhone,
          actionType: "send"
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Store user data in URL parameters to pass to the verification page
      const params = new URLSearchParams({
        email: customerEmail,
        password: customerPassword,
        name: `${customerFirstName} ${customerLastName}`,
        phone: customerPhone,
        accountType: "customer",
        address: customerStreet,
        city: customerCity,
        state: customerState,
        zipCode: customerZipCode
      });
      
      // Show a success toast and redirect to verification page
      toast({
        title: "Verification Code Sent",
        description: `A verification code has been sent to ${customerPhone}. Please verify your phone number.`,
      });
      
      // Redirect to verification page
      navigate(`/verify-phone?${params.toString()}`);
      
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Email blur handler to check if email exists
  const handleEmailBlur = async () => {
    if (customerEmail) {
      await checkEmailExists(customerEmail);
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Create Customer Account</h2>
      
      <div>
        <label htmlFor="customerFirstName" className="block text-sm font-medium mb-1">First Name</label>
        <Input
          id="customerFirstName"
          placeholder="John"
          value={customerFirstName}
          onChange={(e) => setCustomerFirstName(e.target.value)}
          className="welp-input"
          required
        />
      </div>
      
      <div>
        <label htmlFor="customerLastName" className="block text-sm font-medium mb-1">Last Name</label>
        <Input
          id="customerLastName"
          placeholder="Smith"
          value={customerLastName}
          onChange={(e) => setCustomerLastName(e.target.value)}
          className="welp-input"
          required
        />
      </div>
      
      {/* Email field with validation for existing emails */}
      <div>
        <label htmlFor="customerEmail" className="block text-sm font-medium mb-1">Email Address</label>
        <Input
          id="customerEmail"
          type="email"
          placeholder="customer@example.com"
          value={customerEmail}
          onChange={(e) => {
            setCustomerEmail(e.target.value);
            if (existingEmailError) setExistingEmailError(false);
          }}
          onBlur={handleEmailBlur}
          className={`welp-input ${existingEmailError ? 'border-red-500' : ''}`}
          required
        />
        <p className="text-xs text-gray-500 mt-1">This email will be used to log in to your account</p>
        
        {existingEmailError && (
          <Alert className="mt-2 bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 flex flex-col sm:flex-row sm:items-center gap-2">
              <span>This email is already registered.</span>
              <div>
                <Link to="/login" className="text-welp-primary hover:underline font-medium">
                  Sign in instead
                </Link>
                {" or "}
                <Link to="/forgot-password" className="text-welp-primary hover:underline font-medium">
                  Reset password
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <div>
        <label htmlFor="customerPhone" className="block text-sm font-medium mb-1">Phone Number</label>
        <PhoneInput
          id="customerPhone"
          placeholder="(555) 123-4567"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="welp-input"
          required
        />
        <p className="text-xs text-gray-500 mt-1">We'll send a verification code to this number</p>
      </div>
      
      {/* Address fields */}
      <div>
        <label htmlFor="customerStreet" className="block text-sm font-medium mb-1">Street Address</label>
        <AddressAutocomplete
          id="customerStreet"
          placeholder="Start typing your address..."
          value={customerStreet}
          onChange={(e) => setCustomerStreet(e.target.value)}
          onAddressChange={setCustomerStreet}
          onPlaceSelect={handleAddressSelect}
          className="welp-input"
        />
      </div>
      
      <div>
        <label htmlFor="customerCity" className="block text-sm font-medium mb-1">City</label>
        <Input
          id="customerCity"
          placeholder="New York"
          value={customerCity}
          onChange={(e) => setCustomerCity(e.target.value)}
          className="welp-input"
        />
      </div>
      
      <div>
        <label htmlFor="customerState" className="block text-sm font-medium mb-1">State</label>
        <Select value={customerState} onValueChange={setCustomerState}>
          <SelectTrigger className="welp-input">
            <SelectValue placeholder="Select State" />
          </SelectTrigger>
          <SelectContent className="bg-white max-h-60">
            {US_STATES.map((state) => (
              <SelectItem key={state} value={state}>{state}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label htmlFor="customerZipCode" className="block text-sm font-medium mb-1">ZIP Code</label>
        <Input
          id="customerZipCode"
          placeholder="12345"
          value={customerZipCode}
          onChange={(e) => setCustomerZipCode(e.target.value)}
          className="welp-input"
          required
        />
      </div>
      
      <div>
        <label htmlFor="customerPassword" className="block text-sm font-medium mb-1">Password</label>
        <Input
          id="customerPassword"
          type="password"
          value={customerPassword}
          onChange={(e) => setCustomerPassword(e.target.value)}
          className="welp-input"
          required
        />
      </div>
      
      <div>
        <label htmlFor="customerConfirmPassword" className="block text-sm font-medium mb-1">Confirm Password</label>
        <Input
          id="customerConfirmPassword"
          type="password"
          value={customerConfirmPassword}
          onChange={(e) => setCustomerConfirmPassword(e.target.value)}
          className="welp-input"
          required
        />
      </div>
      
      <div className="pt-4">
        <Button
          onClick={handleCreateCustomerAccount}
          className="welp-button w-full"
          disabled={
            !customerFirstName || 
            !customerLastName || 
            !customerPhone || 
            !customerEmail || 
            !customerPassword || 
            customerPassword !== customerConfirmPassword ||
            isSubmitting ||
            existingEmailError
          }
        >
          {isSubmitting ? "Sending Verification..." : "Continue to Verification"}
        </Button>
        
        {customerPassword !== customerConfirmPassword && customerConfirmPassword && (
          <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
        )}
      </div>
    </div>
  );
};

export default CustomerSignupForm;
