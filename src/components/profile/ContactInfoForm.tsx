
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "./types";
import StateSelect from "@/components/search/StateSelect";
import { AddressComponents } from "@/utils/addressExtraction";
import { logger } from "@/utils/logger";
import { useMemo, useRef, useCallback } from "react";

interface ContactInfoFormProps {
  form: UseFormReturn<ProfileFormValues>;
}

const ContactInfoForm = ({ form }: ContactInfoFormProps) => {
  const componentLogger = useMemo(() => logger.withContext('ContactInfoForm'), []);
  const isAutocompletingRef = useRef(false);
  const manualInputTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleAddressComponentsExtracted = useCallback((components: AddressComponents) => {
    componentLogger.debug('Components extracted, updating ALL fields:', components);

    // Set flag to indicate autocomplete is in progress
    isAutocompletingRef.current = true;

    // Clear any pending manual input timeout to prevent it from overwriting our changes
    if (manualInputTimeoutRef.current) {
      componentLogger.debug('Clearing pending manual input timeout');
      clearTimeout(manualInputTimeoutRef.current);
      manualInputTimeoutRef.current = null;
    }

    // Update the street address field with ONLY the street portion
    if (components.streetAddress) {
      componentLogger.debug('Setting address to street address only:', components.streetAddress);
      form.setValue('address', components.streetAddress);
    }

    // Update other form fields
    if (components.city) {
      componentLogger.debug('Setting city:', components.city);
      form.setValue('city', components.city);
    }
    if (components.state) {
      componentLogger.debug('Setting state:', components.state);
      form.setValue('state', components.state);
    }
    if (components.zipCode) {
      componentLogger.debug('Setting zipCode:', components.zipCode);
      form.setValue('zipCode', components.zipCode);
    }

    // Reset flag after a short delay
    setTimeout(() => {
      isAutocompletingRef.current = false;
    }, 200);
  }, [form, componentLogger]);

  const handleManualAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    componentLogger.debug('Address input changed:', { value, isAutocompleting: isAutocompletingRef.current });

    // Don't update form if autocomplete is in progress
    if (isAutocompletingRef.current) {
      componentLogger.debug('Skipping manual update - autocomplete in progress');
      return;
    }

    // Clear any pending timeout
    if (manualInputTimeoutRef.current) {
      clearTimeout(manualInputTimeoutRef.current);
    }

    // Debounce manual input to give autocomplete a chance to complete
    manualInputTimeoutRef.current = setTimeout(() => {
      if (!isAutocompletingRef.current) {
        componentLogger.debug('Updating form with manual input:', value);
        form.setValue('address', value);
      }
    }, 100);
  }, [form, componentLogger]);

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
                onChange={handleManualAddressChange}
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
              <CityAutocomplete
                placeholder="Start typing city name..."
                value={field.value || ""}
                onCitySelect={(city, state) => {
                  componentLogger.debug('City autocomplete selected:', { city, state });
                  form.setValue('city', city);
                  if (state) {
                    form.setValue('state', state);
                  }
                }}
                onCityChange={(city) => {
                  componentLogger.debug('Manual city change:', city);
                  form.setValue('city', city);
                }}
              />
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
