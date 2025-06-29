
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "./types";
import StateSelect from "@/components/search/StateSelect";
import { extractAddressComponents, AddressComponents } from "@/utils/addressExtraction";

interface ContactInfoFormProps {
  form: UseFormReturn<ProfileFormValues>;
}

const ContactInfoForm = ({ form }: ContactInfoFormProps) => {
  const handleAddressSelect = (place: google.maps.places.PlaceResult) => {
    if (!place.address_components) return;

    console.log('🏠 ContactInfoForm - Place selected:', place);
    
    // Extract address components using the utility function
    const components = extractAddressComponents(place);
    
    console.log('🏠 ContactInfoForm - Extracted components:', components);

    // Update the street address field with just the street portion
    if (components.streetAddress) {
      form.setValue('address', components.streetAddress);
    }
    
    // Update other form fields directly
    if (components.city) form.setValue('city', components.city);
    if (components.state) form.setValue('state', components.state);
    if (components.zipCode) form.setValue('zipCode', components.zipCode);
  };

  const handleAddressComponentsExtracted = (components: AddressComponents) => {
    console.log('🏠 ContactInfoForm - Components extracted:', components);
    
    // Update fields that are currently empty to avoid overwriting user input
    if (components.city && !form.getValues('city')) {
      form.setValue('city', components.city);
    }
    if (components.state && !form.getValues('state')) {
      form.setValue('state', components.state);
    }
    if (components.zipCode && !form.getValues('zipCode')) {
      form.setValue('zipCode', components.zipCode);
    }
  };

  const handleAddressChange = (address: string) => {
    console.log('🏠 ContactInfoForm - Address changed to:', address);
    form.setValue('address', address);
  };

  return (
    <>
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <PhoneInput placeholder="Your phone number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street Address</FormLabel>
            <FormControl>
              <AddressAutocomplete 
                placeholder="Start typing your address..."
                value={field.value || ""}
                onChange={(e) => {
                  console.log('🏠 ContactInfoForm - Input changed:', e.target.value);
                  field.onChange(e.target.value);
                }}
                onAddressChange={handleAddressChange}
                onPlaceSelect={handleAddressSelect}
                onAddressComponentsExtracted={handleAddressComponentsExtracted}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="suite"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Suite, Unit, Floor, etc. (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Suite 100, Unit B, Floor 2, etc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>City</FormLabel>
            <FormControl>
              <Input placeholder="Your city" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="state"
        render={({ field }) => (
          <FormItem>
            <FormLabel>State</FormLabel>
            <FormControl>
              <StateSelect 
                value={field.value || ""} 
                onValueChange={field.onChange} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="zipCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ZIP Code</FormLabel>
            <FormControl>
              <Input placeholder="Your ZIP code" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default ContactInfoForm;
