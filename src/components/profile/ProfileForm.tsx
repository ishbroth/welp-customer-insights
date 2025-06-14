
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

const ProfileForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useAuth();
  
  const isBusinessAccount = currentUser?.type === "business" || currentUser?.type === "admin";

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      bio: currentUser?.bio || "",
      businessId: currentUser?.businessId || "",
      licenseType: currentUser?.licenseType || "",
      phone: currentUser?.phone || "",
      address: currentUser?.address || "",
      city: currentUser?.city || "",
      state: currentUser?.state || "",
      zipCode: currentUser?.zipCode || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      console.log("=== FORM SUBMIT START ===");
      console.log("Form data submitted:", data);
      
      // Create update object with only the fields that have values
      const updateData: any = {};
      
      if (data.name) updateData.name = data.name;
      if (data.email) updateData.email = data.email;
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (data.businessId !== undefined) updateData.businessId = data.businessId;
      if (data.licenseType !== undefined) updateData.licenseType = data.licenseType;
      if (data.phone) updateData.phone = data.phone;
      if (data.address) updateData.address = data.address;
      if (data.city) updateData.city = data.city;
      if (data.state) updateData.state = data.state;
      if (data.zipCode) updateData.zipCode = data.zipCode;
      
      // Always preserve current avatar and type
      updateData.avatar = currentUser?.avatar || '';
      updateData.type = currentUser?.type || 'customer';
      
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
