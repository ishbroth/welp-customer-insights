
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";

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
  apartmentSuite?: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  website: string;
  additionalLicenses: string;
  additionalInfo: string;
}

interface ManualVerificationFieldsProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
}

const ManualVerificationFields = ({ 
  formData, 
  onInputChange
}: ManualVerificationFieldsProps) => {
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
    if (city) onInputChange("city", city);
    if (state) onInputChange("state", state);
    if (zipCode) onInputChange("zipCode", zipCode);
  };

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
        <AddressAutocomplete
          id="address"
          value={formData.address}
          onChange={(e) => onInputChange("address", e.target.value)}
          onAddressChange={(address) => onInputChange("address", address)}
          onPlaceSelect={handleAddressSelect}
        />
      </div>

      <div>
        <Label htmlFor="apartmentSuite">Suite, Unit, Floor, etc. (Optional)</Label>
        <Input
          id="apartmentSuite"
          value={formData.apartmentSuite || ''}
          onChange={(e) => onInputChange("apartmentSuite", e.target.value)}
          placeholder="Suite 100, Unit B, Floor 2, etc."
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
    </>
  );
};

export default ManualVerificationFields;
