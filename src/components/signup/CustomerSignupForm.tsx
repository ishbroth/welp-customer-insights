
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";

const CustomerSignupForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please check and try again.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signup({
        email,
        password,
        name,
        phone,
        zipCode,
        address,
        city,
        state,
        type: 'customer'
      });

      if (result.success) {
        toast({
          title: "Account Created Successfully!",
          description: "Your customer account has been created. You can now log in.",
        });
        
        navigate("/login", {
          state: {
            message: "Account created successfully! Please log in with your credentials.",
            email: email
          }
        });
      } else {
        toast({
          title: "Signup Error",
          description: result.error || "Failed to create account. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during signup.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="welp-input"
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="welp-input"
            required
          />
        </div>

        <div>
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="welp-input"
            required
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="welp-input"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="welp-input"
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            type="text"
            placeholder="123 Main St"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="welp-input"
          />
        </div>

        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            type="text"
            placeholder="New York"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="welp-input"
          />
        </div>

        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            type="text"
            placeholder="NY"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="welp-input"
          />
        </div>

        <div>
          <Label htmlFor="zipCode">Zip Code</Label>
          <Input
            id="zipCode"
            type="text"
            placeholder="10001"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="welp-input"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="welp-button w-full mt-6" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating Account..." : "Create Customer Account"}
      </Button>
    </form>
  );
};

export default CustomerSignupForm;
