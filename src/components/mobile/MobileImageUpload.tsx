import React, { useState, useCallback } from 'react';
import { Camera, CameraResultType, CameraSource, ImageOptions } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CameraIcon, ImageIcon, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/sonner';
import { logger } from '@/utils/logger';

interface MobileImageUploadProps {
  onImageSelect: (imageData: string) => void;
  onImageRemove?: () => void;
  currentImage?: string;
  maxImages?: number;
  quality?: number;
  allowEditing?: boolean;
}

const MobileImageUpload: React.FC<MobileImageUploadProps> = ({
  onImageSelect,
  onImageRemove,
  currentImage,
  maxImages = 1,
  quality = 80,
  allowEditing = true
}) => {
  const componentLogger = logger.withContext('MobileImageUpload');
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  const imageOptions: ImageOptions = {
    quality,
    allowEditing,
    resultType: CameraResultType.DataUrl,
    width: 800, // Optimize for mobile performance
    height: 600
  };

  const handleCameraCapture = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      toast.error('Camera is only available on mobile devices');
      return;
    }

    try {
      setIsLoading(true);
      const image = await Camera.getPhoto({
        ...imageOptions,
        source: CameraSource.Camera
      });

      if (image.dataUrl) {
        onImageSelect(image.dataUrl);
        toast.success('Photo captured successfully');
      }
    } catch (error) {
      componentLogger.error('Camera error', { error });
      toast.error('Failed to capture photo');
    } finally {
      setIsLoading(false);
    }
  }, [imageOptions, onImageSelect]);

  const handleGallerySelect = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      toast.error('Gallery is only available on mobile devices');
      return;
    }

    try {
      setIsLoading(true);
      const image = await Camera.getPhoto({
        ...imageOptions,
        source: CameraSource.Photos
      });

      if (image.dataUrl) {
        onImageSelect(image.dataUrl);
        toast.success('Image selected successfully');
      }
    } catch (error) {
      componentLogger.error('Gallery error', { error });
      toast.error('Failed to select image');
    } finally {
      setIsLoading(false);
    }
  }, [imageOptions, onImageSelect]);

  const handleRemoveImage = useCallback(() => {
    if (onImageRemove) {
      onImageRemove();
      toast.info('Image removed');
    }
  }, [onImageRemove]);

  // Only render on mobile
  if (!isMobile) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          {currentImage ? (
            <div className="relative">
              <img 
                src={currentImage} 
                alt="Selected" 
                className="w-full h-48 object-cover rounded-lg"
              />
              {onImageRemove && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 p-2 h-8 w-8"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <div className="space-y-2">
                <div className="flex justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No image selected
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleCameraCapture}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2"
              size="sm"
            >
              <CameraIcon className="h-4 w-4" />
              Camera
            </Button>
            
            <Button 
              onClick={handleGallerySelect}
              disabled={isLoading}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
              size="sm"
            >
              <ImageIcon className="h-4 w-4" />
              Gallery
            </Button>
          </div>

          {!Capacitor.isNativePlatform() && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700">
                Camera and gallery features work on mobile devices only
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(MobileImageUpload);