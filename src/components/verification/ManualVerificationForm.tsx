
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { BUSINESS_TYPE_OPTIONS, US_STATES } from "@/components/signup/businessFormData";

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
  "Painter", "Landscaping", "Flooring", "Carpentry", "Masonry", "Concrete",
  "Drywall", "Insulation", "Windows & Doors", "Kitchen & Bath Remodeling",
  "School", "Tutoring", "Restaurant", "Bar", "Catering", "Doctor", 
  "Dentist", "Veterinarian", "Law Firm", "Accounting", "Consulting", 
  "Real Estate Agent", "Property Management", "Retail Store", "E-commerce", 
  "Software Development", "IT Services", "Other"
].sort();

interface FormData {
  businessName: string;
  primaryLicense: string;
  licenseState: string;
  licenseType: string;
  businessType: string;
  businessSubcategory: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  website: string;
  additionalLicenses: string;
  additionalInfo: string;
}

interface ManualVerificationFormProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

const ManualVerificationForm = ({ 
  formData, 
  onInputChange, 
  onSubmit, 
  isSubmitting 
}: ManualVerificationFormProps) => {
  return (
    <>
      <div>
        <Label htmlFor="licenseType">License Type</Label>
        <Select value={formData.licenseType} onValueChange={(value) => onInputChange("licenseType", value)}>
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
        <Label htmlFor="businessCategory">Business Category *</Label>
        <Select value={formData.businessType} onValueChange={(value) => onInputChange("businessType", value)}>
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
        <Select value={formData.businessSubcategory} onValueChange={(value) => onInputChange("businessSubcategory", value)}>
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
          onChange={(e) => onInputChange("address", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          value={formData.city}
          onChange={(e) => onInputChange("city", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="state">State</Label>
        <Input
          id="state"
          value={formData.state}
          onChange={(e) => onInputChange("state", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="zipCode">ZIP Code</Label>
        <Input
          id="zipCode"
          value={formData.zipCode}
          onChange={(e) => onInputChange("zipCode", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => onInputChange("phone", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="website">Website (Optional)</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={(e) => onInputChange("website", e.target.value)}
          placeholder="https://yourbusiness.com"
        />
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="additionalLicenses">Additional Licenses or Certifications</Label>
        <Textarea
          id="additionalLicenses"
          value={formData.additionalLicenses}
          onChange={(e) => onInputChange("additionalLicenses", e.target.value)}
          placeholder="List any additional licenses, certifications, or credentials..."
          rows={3}
        />
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="additionalInfo">Additional Information</Label>
        <Textarea
          id="additionalInfo"
          value={formData.additionalInfo}
          onChange={(e) => onInputChange("additionalInfo", e.target.value)}
          placeholder="Any other information you think would be helpful for verification..."
          rows={3}
        />
      </div>

      <div className="md:col-span-2 text-center pt-4">
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
              Request Manual Verification
            </>
          )}
        </Button>
      </div>
    </>
  );
};

export default ManualVerificationForm;
