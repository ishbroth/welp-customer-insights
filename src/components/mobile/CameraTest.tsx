
import React, { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CameraIcon } from 'lucide-react';
import { logger } from '@/utils/logger';

const CameraTest: React.FC = () => {
  const componentLogger = logger.withContext('CameraTest');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const takePicture = async () => {
    if (!Capacitor.isNativePlatform()) {
      alert('Camera functionality is only available on mobile devices');
      return;
    }

    try {
      setIsLoading(true);
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      setPhoto(image.dataUrl || null);
    } catch (error) {
      componentLogger.error('Error taking photo', { error });
      alert('Error accessing camera. Please check permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectFromGallery = async () => {
    if (!Capacitor.isNativePlatform()) {
      alert('Gallery functionality is only available on mobile devices');
      return;
    }

    try {
      setIsLoading(true);
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      setPhoto(image.dataUrl || null);
    } catch (error) {
      componentLogger.error('Error selecting photo', { error });
      alert('Error accessing photo gallery. Please check permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Camera Test</h2>
        
        <div className="space-y-4">
          <Button 
            onClick={takePicture} 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
          >
            <CameraIcon className="h-5 w-5" />
            {isLoading ? 'Opening Camera...' : 'Take Photo'}
          </Button>
          
          <Button 
            onClick={selectFromGallery} 
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? 'Opening Gallery...' : 'Select from Gallery'}
          </Button>
          
          {photo && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Captured Photo:</p>
              <img 
                src={photo} 
                alt="Captured" 
                className="w-full h-48 object-cover rounded-lg border"
              />
            </div>
          )}
          
          {!Capacitor.isNativePlatform() && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-800">
                📱 Camera features will work when running on a mobile device. 
                Currently running in web browser.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraTest;
