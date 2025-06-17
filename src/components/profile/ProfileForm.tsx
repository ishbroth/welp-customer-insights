
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { profileSchema, ProfileFormValues } from "./types";
import PersonalInfoForm from "./PersonalInfoForm";
import ContactInfoForm from "./ContactInfoForm";
import BusinessInfoForm from "./BusinessInfoForm";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ProfileForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useAuth();
  const [databaseLicenseType, setDatabaseLicenseType] = useState<string>("");
  
  const isBusinessAccount = currentUser?.type === "business" || currentUser?.type === "admin";

  // Fetch the actual license type from database
  useEffect(() => {
    const fetchDatabaseLicenseType = async () => {
      if (!currentUser?.id || !isBusinessAccount) return;

      try {
        const { data: businessData, error } = await supabase
          .from('business_info')
          .select('license_type')
          .eq('id', currentUser.id)
          .single();

        if (error) {
          console.error("Error fetching business license type:", error);
          return;
        }

        console.log("=== PROFILE FORM INIT ===");
        console.log("Database license_type from business_info:", businessData?.license_type);
        setDatabaseLicenseType(businessData?.license_type || "");
      } catch (error) {
        console.error("Error in fetchDatabaseLicenseType:", error);
      }
    };

    fetchDatabaseLicenseType();
  }, [currentUser?.id, isBusinessAccount]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      bio: currentUser?.bio || "",
      businessId: currentUser?.businessId || "",
      licenseType: "", // Will be set below once we fetch from database
      phone: currentUser?.phone || "",
      address: currentUser?.address || "",
      suite: (currentUser as any)?.suite || "",
      city: currentUser?.city || "",
      state: currentUser?.state || "",
      zipCode: currentUser?.zipCode || "",
    },
  });

  // Update the licenseType field when database value is loaded
  useEffect(() => {
    if (databaseLicenseType) {
      console.log("Setting form licenseType to:", databaseLicenseType);
      form.setValue('licenseType', databaseLicenseType);
    }
  }, [databaseLicenseType, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      console.log("=== FORM SUBMIT START ===");
      console.log("Form data submitted:", data);
      
      // Create update object - include all fields that have values
      const updateData: any = {
        name: data.name || "",
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
        console.log("Business account - including licenseType:", data.licenseType);
        console.log("Business account - including businessId:", data.businessId);
      }
      
      console.log("Processed update data:", updateData);
      
      await updateProfile(updateData);
      
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been saved.",
      });

      console.log("=== FORM SUBMIT SUCCESS ===");

      // Navigate back to profile page after successful update
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
      
    } catch (error) {
      console.error("=== FORM SUBMIT ERROR ===");
      console.error("Error updating profile:", error);
      
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
