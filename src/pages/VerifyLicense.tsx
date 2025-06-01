import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Shield, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const LICENSE_TYPES = [
  "Contractors",
  "Law/Legal", 
  "Liquor Licenses",
  "Medical/Dental",
  "Real Estate",
  "Vendors/Sellers"
].sort();

const BUSINESS_CATEGORIES = [
  "Automotive", "Beauty & Wellness", "Construction & Contractors", "Education", 
  "Entertainment", "Finance & Insurance", "Food & Beverage", "Healthcare", 
  "Home & Garden", "Legal Services", "Manufacturing", "Professional Services", 
  "Real Estate", "Retail", "Technology", "Transportation", "Other"
].sort();

const BUSINESS_SUBCATEGORIES = [
  "Auto Repair", "Car Dealership", "Hair Salon", "Spa", "Fitness Center", 
  "General Contractor", "Electrician", "Plumber", "HVAC", "Roofing", 
  "School", "Tutoring", "Restaurant", "Bar", "Catering", "Doctor", 
  "Dentist", "Veterinarian", "Law Firm", "Accounting", "Consulting", 
  "Real Estate Agent", "Property Management", "Retail Store", "E-commerce", 
  "Software Development", "IT Services", "Other"
].sort();

const VerifyLicense = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state - pre-filled from user profile
  const [formData, setFormData] = useState({
    businessName: "",
    primaryLicense: "",
    licenseState: "",
    licenseType: "",
    businessType: "",
    businessSubcategory: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    website: "",
    additionalLicenses: "",
    additionalInfo: ""
  });

  // Pre-fill form with user data
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        businessName: currentUser.name || "",
        primaryLicense: currentUser.businessId || "",
        licenseState: currentUser.state || "",
        address: currentUser.address || "",
        city: currentUser.city || "",
        state: currentUser.state || "",
        zipCode: currentUser.zipCode || "",
        phone: currentUser.phone || ""
      }));
    }
  }, [currentUser]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error("You must be logged in to submit verification");
      return;
    }

    // Validate required fields
    if (!formData.businessName || !formData.primaryLicense || !formData.businessType) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Submitting verification request...");
      
      // Get the session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to submit verification");
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-verification-request', {
        body: {
          userInfo: {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name
          },
          formData
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error("Error sending verification request:", error);
        toast.error(`Failed to submit verification request: ${error.message}`);
        return;
      }

      console.log("Verification request response:", data);
      toast.success("Verification request submitted successfully! You will be notified once reviewed.");
      navigate("/profile");
      
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ea384c] mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button 
            variant="outline"
            className="mb-6" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-[#ea384c] mr-3" />
                <CardTitle className="text-2xl">Business Verification Request</CardTitle>
              </div>
              <CardDescription>
                Please review and complete your business information for verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange("businessName", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="primaryLicense">Primary License Number *</Label>
                    <Input
                      id="primaryLicense"
                      value={formData.primaryLicense}
                      onChange={(e) => handleInputChange("primaryLicense", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="licenseType">License Type</Label>
                    <Select value={formData.licenseType} onValueChange={(value) => handleInputChange("licenseType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select license type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {LICENSE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="licenseState">License State *</Label>
                    <Input
                      id="licenseState"
                      value={formData.licenseState}
                      onChange={(e) => handleInputChange("licenseState", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="businessType">Business Category *</Label>
                    <Select value={formData.businessType} onValueChange={(value) => handleInputChange("businessType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {BUSINESS_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="businessSubcategory">Business Subcategory</Label>
                    <Select value={formData.businessSubcategory} onValueChange={(value) => handleInputChange("businessSubcategory", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business subcategory" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {BUSINESS_SUBCATEGORIES.map((subcategory) => (
                          <SelectItem key={subcategory} value={subcategory}>
                            {subcategory}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="address">Business Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="https://yourbusiness.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="additionalLicenses">Additional Licenses or Certifications</Label>
                  <Textarea
                    id="additionalLicenses"
                    value={formData.additionalLicenses}
                    onChange={(e) => handleInputChange("additionalLicenses", e.target.value)}
                    placeholder="List any additional licenses, certifications, or credentials..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                    placeholder="Any other information you think would be helpful for verification..."
                    rows={3}
                  />
                </div>

                <div className="text-center pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#ea384c] hover:bg-[#d63384] text-white px-8 py-3 text-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Request Business Verification
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyLicense;
