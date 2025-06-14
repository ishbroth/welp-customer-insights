
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "./types";
import { useToast } from "@/hooks/use-toast";
import { BUSINESS_TYPE_OPTIONS } from "@/components/signup/businessFormData";

interface BusinessInfoFormProps {
  form: UseFormReturn<ProfileFormValues>;
}

const BusinessInfoForm = ({ form }: BusinessInfoFormProps) => {
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
  const [isVerifying, setIsVerifying] = useState(false);

  const businessId = form.watch("businessId");

  const handleVerifyBusinessId = async () => {
    if (!businessId) {
      toast({
        title: "Verification Error",
        description: "Please enter a license number first",
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
          description: "Your license has been verified successfully",
        });
      } else {
        setVerificationStatus('failed');
        toast({
          title: "Verification Failed",
          description: result.message || "Could not verify the license",
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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Business Information</h3>
      
      <FormField
        control={form.control}
        name="licenseType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>License Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select license type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {BUSINESS_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="businessId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>License Number</FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input 
                  placeholder="Enter your license number or EIN" 
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
              <p className="text-sm text-green-600 mt-1">License verified successfully</p>
            )}
            {verificationStatus === 'failed' && (
              <p className="text-sm text-red-600 mt-1">License verification failed</p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BusinessInfoForm;
