
import { useState, useRef, ChangeEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import { useToast } from "@/components/ui/use-toast";
import ProfilePhotoSection from "@/components/profile/ProfilePhotoSection";
import PhotoEditDialog from "@/components/profile/PhotoEditDialog";
import ProfileForm from "@/components/profile/ProfileForm";
import AccountTypeSection from "@/components/profile/AccountTypeSection";

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

  const handleSavePhoto = () => {
    // In a real application, you would upload the cropped/rotated image here
    // For now, we'll just use the preview as the new avatar
    updateProfile({ avatar: avatarPreview });
    setIsEditingPhoto(false);
    toast({
      title: "Profile photo updated",
      description: "Your profile photo has been successfully updated.",
    });
  };

  // Check if user is a business type
  const isBusinessAccount = currentUser?.type === "business";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row">
        <ProfileSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Photo Upload Section */}
              <ProfilePhotoSection 
                avatarPreview={avatarPreview}
                userName={currentUser?.name}
                onFileChange={handleFileChange}
              />
              
              {/* Profile Form Section */}
              <div className="md:col-span-2">
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="general">General Information</TabsTrigger>
                    <TabsTrigger value="account">Account Settings</TabsTrigger>
                  </TabsList>
                  <TabsContent value="general" className="mt-6">
                    <ProfileForm 
                      currentUser={currentUser}
                      updateProfile={updateProfile}
                      isBusinessAccount={isBusinessAccount}
                    />
                  </TabsContent>
                  
                  <TabsContent value="account" className="mt-6">
                    <AccountTypeSection 
                      isSubscribed={isSubscribed}
                      currentUserType={currentUser?.type}
                      setIsSubscribed={setIsSubscribed}
                    />
                  </TabsContent>
                </Tabs>
              </div>
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
