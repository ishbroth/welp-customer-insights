
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { profileSchema, ProfileFormValues } from "./types";
import PersonalInfoForm from "./PersonalInfoForm";
import ContactInfoForm from "./ContactInfoForm";
import BusinessInfoForm from "./BusinessInfoForm";

interface ProfileFormProps {
  currentUser: any;
  updateProfile: (data: any) => void;
  isBusinessAccount: boolean;
}

const ProfileForm = ({ currentUser, updateProfile, isBusinessAccount }: ProfileFormProps) => {
  const { toast } = useToast();

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

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      console.log("Submitting profile data:", data);
      
      // Ensure all fields are included in the update
      const updateData = {
        name: data.name,
        email: data.email,
        bio: data.bio,
        businessId: data.businessId,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        // Include avatar and type from current user to preserve them
        avatar: currentUser?.avatar || '',
        type: currentUser?.type || 'customer'
      };
      
      console.log("Update data being sent:", updateData);
      
      await updateProfile(updateData);
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <PersonalInfoForm form={form} isBusinessAccount={isBusinessAccount} />
        
        <ContactInfoForm form={form} />

        {/* Only render businessId field for business accounts */}
        {isBusinessAccount && <BusinessInfoForm form={form} />}
        
        <Button type="submit" className="w-full md:w-auto">
          Save Changes
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
