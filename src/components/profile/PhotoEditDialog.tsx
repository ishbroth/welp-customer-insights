
import { Crop, RotateCcw, RotateCw, Scissors } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop as CropType, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface PhotoEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  avatarPreview: string | null;
  rotation: number;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onSave: (croppedImage: string) => void;
}

const PhotoEditDialog = ({
  isOpen,
  onOpenChange,
  avatarPreview,
  rotation,
  onRotateLeft,
  onRotateRight,
  onSave,
}: PhotoEditDialogProps) => {
  const [crop, setCrop] = useState<CropType>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop({
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5,
    });
  }, []);

  const getCroppedImg = useCallback(async (): Promise<string> => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return avatarPreview || '';
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return avatarPreview || '';
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(avatarPreview || '');
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.95);
    });
  }, [completedCrop, avatarPreview]);

  const handleSave = async () => {
    const croppedImage = await getCroppedImg();
    onSave(croppedImage);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Profile Photo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="w-full">
            {avatarPreview && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  src={avatarPreview}
                  alt="Crop preview"
                  className="w-full h-auto max-h-96 object-contain"
                  style={{ transform: `rotate(${rotation}deg)` }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            )}
          </div>
          
          <div className="flex justify-center space-x-2">
            <Button size="sm" variant="outline" onClick={onRotateLeft}>
              <RotateCcw className="h-4 w-4 mr-1" /> Rotate Left
            </Button>
            <Button size="sm" variant="outline" onClick={onRotateRight}>
              <RotateCw className="h-4 w-4 mr-1" /> Rotate Right
            </Button>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Scissors className="h-4 w-4 mr-1" />
              Save Cropped Photo
            </Button>
          </div>
        </div>
        
        {/* Hidden canvas for image processing */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PhotoEditDialog;
