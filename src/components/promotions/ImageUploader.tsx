import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface ImageUploaderProps {
  imageUrls: string[];
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
}

const ImageUploader = ({ imageUrls, onImagesChange, maxImages = 3 }: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remaining = maxImages - imageUrls.length;

    if (remaining <= 0) {
      toast.error("Maximum images reached", { description: `You can upload up to ${maxImages} images.` });
      return;
    }

    const toUpload = fileArray.slice(0, remaining);
    setIsUploading(true);

    try {
      const newUrls: string[] = [];

      for (const file of toUpload) {
        if (!file.type.startsWith("image/")) continue;

        const ext = file.name.split(".").pop();
        const fileName = `promo-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { data, error } = await supabase.storage
          .from("promotion-images")
          .upload(fileName, file, { contentType: file.type });

        if (error) {
          console.error("Upload error:", error);
          toast.error("Failed to upload image");
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("promotion-images")
          .getPublicUrl(data.path);

        newUrls.push(urlData.publicUrl);
      }

      if (newUrls.length > 0) {
        onImagesChange([...imageUrls, ...newUrls]);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  }, [imageUrls, maxImages, onImagesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleRemove = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    onImagesChange(newUrls);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">
        Images ({imageUrls.length}/{maxImages})
      </label>

      {imageUrls.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragOver ? "border-primary bg-primary/5" : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isUploading ? "Uploading..." : "Drag & drop images or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, or WebP</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>
      )}

      {imageUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
