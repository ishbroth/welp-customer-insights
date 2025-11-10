
import { useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from 'lucide-react';
import { useNativeCamera } from '@/hooks/useNativeCamera';

interface ProfilePhotoSectionProps {
  avatarPreview: string | null;
  userName?: string;
  onFileChange: (file: File) => void;
}

const ProfilePhotoSection = ({ avatarPreview, userName, onFileChange }: ProfilePhotoSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCamera = useNativeCamera();

  const handlePhotoClick = async () => {
    // Use native camera/photo picker on mobile
    if (nativeCamera.isAvailable) {
      const result = await nativeCamera.choosePhoto();
      if (result.success && result.dataUrl) {
        // Convert data URL to File object
        const response = await fetch(result.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
        onFileChange(file);
      }
    } else {
      // Fall back to web file input on desktop
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };

  return (
    <div className="md:col-span-1">
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="h-32 w-32 cursor-pointer" onClick={handlePhotoClick}>
          {avatarPreview ? (
            <AvatarImage src={avatarPreview} alt={userName || "Profile"} />
          ) : (
            <AvatarFallback className="text-2xl">
              {userName?.[0] || "U"}
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
  );
};

export default ProfilePhotoSection;
