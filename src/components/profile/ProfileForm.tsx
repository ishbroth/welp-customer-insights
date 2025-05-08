
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { MapPin, Phone, Search } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock address data for our autocomplete
const mockAddressData = [
  { address: "123 Main St", city: "San Francisco", state: "California", zip: "94105" },
  { address: "456 Market St", city: "San Francisco", state: "California", zip: "94103" },
  { address: "789 Mission St", city: "San Francisco", state: "California", zip: "94103" },
  { address: "101 Powell St", city: "San Francisco", state: "California", zip: "94102" },
  { address: "200 Geary St", city: "San Francisco", state: "California", zip: "94102" },
  { address: "501 Pine St", city: "San Francisco", state: "California", zip: "94102" },
];

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  bio: z.string().optional(),
  businessId: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  currentUser: any;
  updateProfile: (data: any) => void;
  isBusinessAccount: boolean;
}

const ProfileForm = ({ currentUser, updateProfile, isBusinessAccount }: ProfileFormProps) => {
  const { toast } = useToast();
  const [addressSearchTerm, setAddressSearchTerm] = useState("");
  const [isAddressPopoverOpen, setIsAddressPopoverOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
  const [isVerifying, setIsVerifying] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      bio: currentUser?.bio || "",
      businessId: currentUser?.businessId || "",
      phone: currentUser?.phone || "",
      address: currentUser?.address || "",
      city: currentUser?.city || "",
      state: currentUser?.state || "",
      zipCode: currentUser?.zipCode || "",
    },
  });

  const businessId = form.watch("businessId");

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

  const handleVerifyBusinessId = async () => {
    if (!businessId) {
      toast({
        title: "Verification Error",
        description: "Please enter a license number or EIN first",
        variant: "destructive",
      });
      return;
    }

    setVerificationStatus('verifying');
    setIsVerifying(true);

    try {
      const result = await import("@/utils/businessVerification").then(module => 
        module.verifyBusinessId(businessId)
      );
      
      if (result.verified) {
        setVerificationStatus('verified');
        toast({
          title: "Verification Successful",
          description: "Your business ID has been verified successfully",
        });
      } else {
        setVerificationStatus('failed');
        toast({
          title: "Verification Failed",
          description: result.message || "Could not verify the business ID",
          variant: "destructive",
        });
      }
    } catch (error) {
      setVerificationStatus('failed');
      toast({
        title: "Verification Error",
        description: "An error occurred during verification",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    // In a real application, you would send this data to your backend
    updateProfile({
      name: data.name,
      email: data.email,
      businessId: data.businessId,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
    });
    
    toast({
      title: "Profile updated",
      description: "Your profile information has been successfully updated.",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isBusinessAccount ? "Business name" : "Name"}</FormLabel>
              <FormControl>
                <Input placeholder={isBusinessAccount ? "Your business name" : "Your name"} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        {/* Only render businessId field for business accounts */}
        {isBusinessAccount && (
          <FormField
            control={form.control}
            name="businessId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Number / EIN</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input 
                      placeholder="Enter your business license or EIN" 
                      {...field} 
                      className="flex-grow"
                    />
                  </FormControl>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleVerifyBusinessId}
                    disabled={!businessId || isVerifying}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {isVerifying ? "Verifying..." : "Verify"}
                  </Button>
                </div>
                {verificationStatus === 'verified' && (
                  <p className="text-sm text-green-600 mt-1">Business ID verified successfully</p>
                )}
                {verificationStatus === 'failed' && (
                  <p className="text-sm text-red-600 mt-1">Business ID verification failed</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us a bit about yourself..." 
                  className="min-h-32"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full md:w-auto">
          Save Changes
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
