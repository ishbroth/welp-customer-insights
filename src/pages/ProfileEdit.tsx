
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import ProfileMobileMenu from "@/components/ProfileMobileMenu";

import { useToast } from "@/components/ui/use-toast";
import ProfilePhotoSection from "@/components/profile/ProfilePhotoSection";
import PhotoEditDialog from "@/components/profile/PhotoEditDialog";
import ProfileForm from "@/components/profile/ProfileForm";
import AccountTypeSection from "@/components/profile/AccountTypeSection";
import DeleteAccountSection from "@/components/profile/DeleteAccountSection";

const ProfileEdit = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, updateProfile, isSubscribed, setIsSubscribed } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentUser?.avatar || null);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
      setRotation(0); // Reset rotation when new file is selected
      setIsEditingPhoto(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSavePhoto = async (croppedImage: string) => {
    try {
      console.log("=== SAVING PHOTO ===");
      console.log("Cropped image length:", croppedImage.length);
      
      // Update profile with the cropped image
      await updateProfile({ avatar: croppedImage });
      
      // Update local state
      setAvatarPreview(croppedImage);
      setIsEditingPhoto(false);
      setRotation(0);
      
      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been successfully updated.",
      });
      
      console.log("=== PHOTO SAVE SUCCESS ===");
    } catch (error) {
      console.error("=== PHOTO SAVE ERROR ===");
      console.error("Error saving profile photo:", error);
      toast({
        title: "Error",
        description: "Failed to save profile photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Check if user is a business type
  const isBusinessAccount = currentUser?.type === "business";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <ProfileMobileMenu />
      <div className="flex-grow flex">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <ProfileSidebar isOpen={true} toggle={() => {}} />
        </div>
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-4xl px-4 md:px-6">
            {/* Mobile: Header and Avatar Stacked */}
            <div className="flex flex-col md:hidden space-y-6 mb-8">
              <h1 className="text-2xl font-bold">Edit Profile</h1>
              <ProfilePhotoSection 
                avatarPreview={avatarPreview}
                userName={currentUser?.name}
                onFileChange={handleFileChange}
              />
            </div>
            
            {/* Desktop: Grid Layout */}
            <div className="hidden md:block">
              <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
              <div className="grid grid-cols-3 gap-8">
                <ProfilePhotoSection 
                  avatarPreview={avatarPreview}
                  userName={currentUser?.name}
                  onFileChange={handleFileChange}
                />
                <div className="col-span-2">
                  <Tabs defaultValue="general" className="w-full">
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="general">General Information</TabsTrigger>
                      <TabsTrigger value="account">Account Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="general" className="mt-6">
                      <ProfileForm />
                    </TabsContent>
                    <TabsContent value="account" className="mt-6 space-y-6">
                      <AccountTypeSection 
                        isSubscribed={isSubscribed}
                        currentUserType={currentUser?.type}
                        setIsSubscribed={setIsSubscribed}
                      />
                      <DeleteAccountSection />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
            
            {/* Mobile: Full Width Form */}
            <div className="md:hidden max-w-none">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="w-full grid grid-cols-2 h-12 gap-1 p-1">
                  <TabsTrigger value="general" className="text-xs sm:text-sm">General Information</TabsTrigger>
                  <TabsTrigger value="account" className="text-xs sm:text-sm">Account Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="mt-6">
                  <ProfileForm />
                </TabsContent>
                <TabsContent value="account" className="mt-6 space-y-6">
                  <AccountTypeSection 
                    isSubscribed={isSubscribed}
                    currentUserType={currentUser?.type}
                    setIsSubscribed={setIsSubscribed}
                  />
                  <DeleteAccountSection />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
      
      {/* Photo Editing Dialog */}
      <PhotoEditDialog 
        isOpen={isEditingPhoto}
        onOpenChange={setIsEditingPhoto}
        avatarPreview={avatarPreview}
        rotation={rotation}
        onRotateLeft={handleRotateLeft}
        onRotateRight={handleRotateRight}
        onSave={handleSavePhoto}
      />
      
      <Footer />
    </div>
  );
};

export default ProfileEdit;
