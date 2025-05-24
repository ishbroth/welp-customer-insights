
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

interface ProfileFormProps {
  currentUser: any;
  updateProfile: (data: any) => void;
  isBusinessAccount: boolean;
}

const ProfileForm = ({ currentUser, updateProfile, isBusinessAccount }: ProfileFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

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
      
      // Update the current user in the auth context with the new data
      setCurrentUser({
        ...currentUser,
        ...updateData
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been successfully updated.",
      });

      // Navigate back to profile page after successful update
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
      
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
