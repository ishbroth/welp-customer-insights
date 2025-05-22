
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { MapPin, Phone } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "./types";

// Mock address data for our autocomplete
const mockAddressData = [
  { address: "123 Main St", city: "San Francisco", state: "California", zip: "94105" },
  { address: "456 Market St", city: "San Francisco", state: "California", zip: "94103" },
  { address: "789 Mission St", city: "San Francisco", state: "California", zip: "94103" },
  { address: "101 Powell St", city: "San Francisco", state: "California", zip: "94102" },
  { address: "200 Geary St", city: "San Francisco", state: "California", zip: "94102" },
  { address: "501 Pine St", city: "San Francisco", state: "California", zip: "94102" },
];

interface ContactInfoFormProps {
  form: UseFormReturn<ProfileFormValues>;
}

const ContactInfoForm = ({ form }: ContactInfoFormProps) => {
  const [addressSearchTerm, setAddressSearchTerm] = useState("");
  const [isAddressPopoverOpen, setIsAddressPopoverOpen] = useState(false);

  // Filter addresses based on search term
  const filteredAddresses = addressSearchTerm 
    ? mockAddressData.filter(item => 
        item.address.toLowerCase().includes(addressSearchTerm.toLowerCase()))
    : mockAddressData;

  const handleAddressSelect = (address: typeof mockAddressData[0]) => {
    form.setValue("address", address.address);
    form.setValue("city", address.city);
    form.setValue("state", address.state);
    form.setValue("zipCode", address.zip);
    setAddressSearchTerm(address.address);
    setIsAddressPopoverOpen(false);
  };

  return (
    <>
      {/* Phone Field */}
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number (Optional)</FormLabel>
            <FormControl>
              <div className="flex">
                <Phone className="mr-2 h-4 w-4 mt-3 text-muted-foreground" />
                <Input placeholder="Your phone number" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Address Field with Autocomplete */}
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Address (Optional)</FormLabel>
            <Popover open={isAddressPopoverOpen} onOpenChange={setIsAddressPopoverOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <div className="flex">
                    <MapPin className="mr-2 h-4 w-4 mt-3 text-muted-foreground" />
                    <Input 
                      placeholder="Start typing your address" 
                      value={addressSearchTerm || field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        setAddressSearchTerm(e.target.value);
                        setIsAddressPopoverOpen(true);
                      }}
                      onFocus={() => setIsAddressPopoverOpen(true)}
                    />
                  </div>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0">
                <Command>
                  <CommandInput placeholder="Search address..." className="h-9"
                    value={addressSearchTerm}
                    onValueChange={(value) => setAddressSearchTerm(value)}
                  />
                  <CommandEmpty>No address found.</CommandEmpty>
                  <CommandGroup>
                    {filteredAddresses.map((address, i) => (
                      <CommandItem
                        key={i}
                        value={address.address}
                        onSelect={() => handleAddressSelect(address)}
                        className="cursor-pointer"
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>{address.address}, {address.city}, {address.state} {address.zip}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* City, State, Zip Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="City" {...field} />
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
                <Input placeholder="State" {...field} />
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
              <FormLabel>Zip Code</FormLabel>
              <FormControl>
                <Input placeholder="Zip Code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default ContactInfoForm;
