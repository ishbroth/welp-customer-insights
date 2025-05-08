
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UserRound } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

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
  const { signup } = useAuth();
  
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
      // Create customer account with Supabase
      const { success, error } = await signup({
        email: customerEmail,
        password: customerPassword,
        name: `${customerFirstName} ${customerLastName}`,
        phone: customerPhone,
        zipCode: customerZipCode,
        address: customerStreet,
        city: customerCity,
        state: customerState,
        type: "customer"
      });
      
      if (success) {
        // Store verification data in session storage for the onboarding flow
        const customerData = {
          firstName: customerFirstName,
          lastName: customerLastName,
          phone: customerPhone,
          address: customerStreet,
          city: customerCity,
          state: customerState,
          zipCode: customerZipCode,
          email: customerEmail
        };
        
        sessionStorage.setItem("customerSignupData", JSON.stringify(customerData));
        
        // Generate a random 6-digit verification code for demo purposes
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        sessionStorage.setItem("phoneVerificationCode", verificationCode);
        
        // Show a toast indicating that verification is needed
        toast({
          title: "Verification Code Sent",
          description: `A verification code has been sent to ${customerPhone}. For demo purposes, the code is: ${verificationCode}`,
        });
        
        // Redirect to the verification page
        navigate("/verify-phone");
      } else {
        toast({
          title: "Signup Failed",
          description: error || "An error occurred while creating your account.",
          variant: "destructive",
        });
      }
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
      
      {/* Email field moved up to here, right after last name */}
      <div>
        <label htmlFor="customerEmail" className="block text-sm font-medium mb-1">Email Address</label>
        <Input
          id="customerEmail"
          type="email"
          placeholder="customer@example.com"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          className="welp-input"
          required
        />
        <p className="text-xs text-gray-500 mt-1">This email will be used to log in to your account</p>
      </div>
      
      <div>
        <label htmlFor="customerPhone" className="block text-sm font-medium mb-1">Phone Number</label>
        <Input
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
        <Input
          id="customerStreet"
          placeholder="123 Main St"
          value={customerStreet}
          onChange={(e) => setCustomerStreet(e.target.value)}
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
            isSubmitting
          }
        >
          {isSubmitting ? "Creating Account..." : "Create Customer Account"}
        </Button>
        
        {customerPassword !== customerConfirmPassword && customerConfirmPassword && (
          <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
        )}
      </div>
    </div>
  );
};

export default CustomerSignupForm;
