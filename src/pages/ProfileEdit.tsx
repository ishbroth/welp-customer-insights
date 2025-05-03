import { useState, useRef, ChangeEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Crop, RotateCcw, RotateCw, Image as ImageIcon, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { verifyBusinessId } from "@/utils/businessVerification";

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  bio: z.string().optional(),
  businessId: z.string().optional(),
});

const ProfileEdit = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, updateProfile } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentUser?.avatar || null);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      bio: "",
      businessId: currentUser?.businessId || "",
    },
  });

  const businessId = form.watch("businessId");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setIsEditingPhoto(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
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
      const result = await verifyBusinessId(businessId);
      
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

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    // In a real application, you would send this data to your backend
    updateProfile({
      name: data.name,
      email: data.email,
      businessId: data.businessId,
    });
    
    toast({
      title: "Profile updated",
      description: "Your profile information has been successfully updated.",
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
              <div className="md:col-span-1">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-32 w-32 cursor-pointer" onClick={handlePhotoClick}>
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt={currentUser?.name || "Profile"} />
                    ) : (
                      <AvatarFallback className="text-2xl">
                        {currentUser?.name?.[0] || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                  />
                  <Button variant="outline" onClick={handlePhotoClick}>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Change Photo
                  </Button>
                </div>
              </div>
              
              {/* Profile Form Section */}
              <div className="md:col-span-2">
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="general">General Information</TabsTrigger>
                    <TabsTrigger value="account">Account Settings</TabsTrigger>
                  </TabsList>
                  <TabsContent value="general" className="mt-6">
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
                  </TabsContent>
                  
                  <TabsContent value="account" className="mt-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Account Type</h3>
                        <div className="px-4 py-3 bg-gray-50 rounded-md">
                          <p className="font-semibold">{currentUser?.type === "business" ? "Business Account" : "Customer Account"}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Photo Editing Dialog */}
      <Dialog open={isEditingPhoto} onOpenChange={setIsEditingPhoto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="w-full">
              <AspectRatio ratio={1} className="overflow-hidden bg-gray-100 rounded-md">
                {avatarPreview && (
                  <img
                    src={avatarPreview}
                    alt="Avatar Preview"
                    className="w-full h-full object-cover transition-transform"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  />
                )}
              </AspectRatio>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button size="sm" variant="outline" onClick={handleRotateLeft}>
                <RotateCcw className="h-4 w-4 mr-1" /> Rotate Left
              </Button>
              <Button size="sm" variant="outline" onClick={handleRotateRight}>
                <RotateCw className="h-4 w-4 mr-1" /> Rotate Right
              </Button>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditingPhoto(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePhoto}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default ProfileEdit;
