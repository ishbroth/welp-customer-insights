
import React, { useState, useRef } from "react";
import { Upload, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PhotoUploadProps {
  photos: Array<{ file: File; caption: string; preview: string }>;
  setPhotos: React.Dispatch<React.SetStateAction<Array<{ file: File; caption: string; preview: string }>>>;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ photos, setPhotos }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (photos.length + files.length > 6) {
      toast({
        title: "Too many photos",
        description: "You can only upload up to 6 photos per review.",
        variant: "destructive",
      });
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select only image files.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select images smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const preview = URL.createObjectURL(file);
      setPhotos(prev => [...prev, { file, caption: "", preview }]);
    });

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const newPhotos = [...prev];
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  };

  const updateCaption = (index: number, caption: string) => {
    if (caption.length > 60) {
      toast({
        title: "Caption too long",
        description: "Captions must be 60 characters or less.",
        variant: "destructive",
      });
      return;
    }

    setPhotos(prev => 
      prev.map((photo, i) => 
        i === index ? { ...photo, caption } : photo
      )
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Photos (Optional - Up to 6 photos)
        </label>
        
        {photos.length < 6 && (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">
              Click to upload photos or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG up to 5MB each
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {photos.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Uploaded Photos ({photos.length}/6)</h4>
          {photos.map((photo, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
              <img 
                src={photo.preview} 
                alt={`Upload ${index + 1}`}
                className="h-16 w-16 object-cover rounded"
              />
              <div className="flex-1 space-y-2">
                <Input
                  type="text"
                  placeholder="Add a caption (optional, max 60 characters)"
                  value={photo.caption}
                  onChange={(e) => updateCaption(index, e.target.value)}
                  maxLength={60}
                  className="text-sm"
                />
                <div className="text-xs text-gray-500">
                  {photo.caption.length}/60 characters
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removePhoto(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
