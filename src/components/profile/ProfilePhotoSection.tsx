
import { useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from 'lucide-react';

interface ProfilePhotoSectionProps {
  avatarPreview: string | null;
  userName?: string;
  onFileChange: (file: File) => void;
}

const ProfilePhotoSection = ({ avatarPreview, userName, onFileChange }: ProfilePhotoSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
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
