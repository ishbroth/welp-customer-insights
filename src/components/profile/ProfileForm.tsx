
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { getProfileSchema, ProfileFormValues } from "./types";
import PersonalInfoForm from "./PersonalInfoForm";
import ContactInfoForm from "./ContactInfoForm";
import BusinessInfoForm from "./BusinessInfoForm";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import WelpLoadingIcon from "@/components/ui/WelpLoadingIcon";
import { logger } from "@/utils/logger";

const ProfileForm = () => {
  const componentLogger = useMemo(() => logger.withContext('ProfileForm'), []);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useAuth();
  const [businessData, setBusinessData] = useState<{
    licenseType: string;
    licenseNumber: string;
  }>({ licenseType: "", licenseNumber: "" });
  const [isLoadingBusinessData, setIsLoadingBusinessData] = useState(false);

  const isBusinessAccount = currentUser?.type === "business" || currentUser?.type === "admin";

  // Get the appropriate schema based on account type
  const profileSchema = useMemo(() => getProfileSchema(isBusinessAccount), [isBusinessAccount]);

  // Fetch business data from database
  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!currentUser?.id || !isBusinessAccount) return;

      setIsLoadingBusinessData(true);
      try {
        // Fetch from business_info table
        const { data: businessInfo, error: businessError } = await supabase
          .from('business_info')
          .select('license_type, license_number')
          .eq('id', currentUser.id)
          .single();

        if (businessError) {
          componentLogger.error("Error fetching business info:", businessError);
          return;
        }

        componentLogger.debug("=== BUSINESS DATA FETCHED ===");
        componentLogger.debug("Business info from database:", businessInfo);
        
        setBusinessData({
          licenseType: businessInfo?.license_type || "",
          licenseNumber: businessInfo?.license_number || currentUser?.businessId || ""
        });
      } catch (error) {
        componentLogger.error("Error in fetchBusinessData:", error);
      } finally {
        setIsLoadingBusinessData(false);
      }
    };

    fetchBusinessData();
  }, [currentUser?.id, isBusinessAccount]);

  // Get firstName and lastName from currentUser, or parse from name if not available
  const getFirstAndLastName = () => {
    // If we have firstName/lastName in currentUser, use those
    if (currentUser?.firstName || currentUser?.lastName) {
      return {
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || ""
      };
    }

    // Otherwise, parse from the name field for backward compatibility
    if (!isBusinessAccount && currentUser?.name) {
      const parts = currentUser.name.trim().split(/\s+/);
      if (parts.length === 1) {
        return { firstName: parts[0], lastName: "" };
      }
      return {
        firstName: parts[0],
        lastName: parts.slice(1).join(" ")
      };
    }

    return { firstName: "", lastName: "" };
  };

  const { firstName: parsedFirstName, lastName: parsedLastName } = getFirstAndLastName();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name || "",
      firstName: parsedFirstName,
      lastName: parsedLastName,
      email: currentUser?.email || "",
      bio: currentUser?.bio || "",
      businessId: "",
      licenseType: "",
      phone: currentUser?.phone || "",
      address: currentUser?.address || "",
      suite: (currentUser as any)?.suite || "",
      city: currentUser?.city || "",
      state: currentUser?.state || "",
      zipCode: currentUser?.zipCode || "",
    },
  });

  // Re-validate form when schema changes (e.g., when account type is loaded)
  useEffect(() => {
    form.trigger();
  }, [profileSchema, form]);

  // Update form values when business data is loaded
  useEffect(() => {
    if (businessData.licenseType || businessData.licenseNumber) {
      componentLogger.debug("Setting form values with business data:", businessData);
      
      if (businessData.licenseType) {
        form.setValue('licenseType', businessData.licenseType);
      }
      
      if (businessData.licenseNumber) {
        form.setValue('businessId', businessData.licenseNumber);
      }
    }
  }, [businessData, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      componentLogger.debug("=== FORM SUBMIT START ===");
      componentLogger.debug("Form data submitted:", data);

      // For customer accounts, combine firstName and lastName into name
      let fullName = data.name || "";
      if (!isBusinessAccount && data.firstName && data.lastName) {
        fullName = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();
        componentLogger.debug("Combined customer name:", fullName);
      } else if (!isBusinessAccount && data.firstName) {
        fullName = data.firstName.trim();
        componentLogger.debug("Using first name only:", fullName);
      }

      // Create update object - include all fields that have values
      const updateData: any = {
        name: fullName,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        bio: data.bio || "",
        phone: data.phone || "",
        address: data.address || "",
        suite: data.suite || "",
        city: data.city || "",
        state: data.state || "",
        zipCode: data.zipCode || "",
        // Always preserve current avatar and type
        avatar: currentUser?.avatar || '',
        type: currentUser?.type || 'customer',
      };

      // For business accounts, include business-specific fields
      if (isBusinessAccount) {
        updateData.businessId = data.businessId || "";
        updateData.licenseType = data.licenseType || "";
        componentLogger.debug("Business account - including licenseType:", data.licenseType);
        componentLogger.debug("Business account - including businessId:", data.businessId);
      }

      componentLogger.debug("Processed update data:", updateData);
      
      await updateProfile(updateData);
      
      // Show success toast immediately after successful update
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been saved.",
      });

      componentLogger.debug("=== FORM SUBMIT SUCCESS ===");

      // Navigate back to profile page after successful update
      setTimeout(() => {
        navigate('/profile');
      }, 1500);

    } catch (error) {
      componentLogger.error("=== FORM SUBMIT ERROR ===");
      componentLogger.error("Error updating profile:", error);
      
      // Show generic error message for profile updates
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading state while fetching business data
  if (isBusinessAccount && isLoadingBusinessData) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[400px] bg-welp-primary">
        <WelpLoadingIcon size={120} />
      </div>
    );
  }

  const handleInvalidSubmit = (errors: any) => {
    componentLogger.error("=== FORM VALIDATION FAILED ===");
    componentLogger.error("Validation errors:", errors);

    // Show toast with validation errors
    const errorMessages = Object.keys(errors).map(key => {
      return `${key}: ${errors[key]?.message || 'Invalid'}`;
    }).join(', ');

    toast({
      title: "Please fix the following errors",
      description: errorMessages,
      variant: "destructive",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, handleInvalidSubmit)} className="space-y-6">
        <PersonalInfoForm form={form} isBusinessAccount={isBusinessAccount} />

        <ContactInfoForm form={form} />

        {/* Only render business info fields for business accounts */}
        {isBusinessAccount && <BusinessInfoForm form={form} />}

        <div className="flex gap-4">
          <Button type="submit" className="w-full md:w-auto">
            Save Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full md:w-auto"
            onClick={() => navigate('/profile')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProfileForm;
