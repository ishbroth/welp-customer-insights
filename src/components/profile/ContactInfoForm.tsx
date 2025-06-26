
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "./types";
import StateSelect from "@/components/search/StateSelect";
import { normalizeAddress } from "@/utils/addressNormalization";

interface ContactInfoFormProps {
  form: UseFormReturn<ProfileFormValues>;
}

const ContactInfoForm = ({ form }: ContactInfoFormProps) => {
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

    // Create the street address (just street number + route)
    const streetAddress = `${streetNumber} ${route}`.trim();
    if (streetAddress) {
      const normalizedAddress = normalizeAddress(streetAddress);
      form.setValue('address', normalizedAddress);
    }

    // Update other form fields
    if (city) form.setValue('city', city);
    if (state) form.setValue('state', state);
    if (zipCode) form.setValue('zipCode', zipCode);
  };

  const handleAddressChange = (address: string) => {
    // Normalize the address when it changes
    const normalizedAddress = normalizeAddress(address);
    form.setValue('address', normalizedAddress);
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
                  const normalizedAddress = normalizeAddress(e.target.value);
                  field.onChange(normalizedAddress);
                }}
                onAddressChange={handleAddressChange}
                onPlaceSelect={handleAddressSelect}
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
