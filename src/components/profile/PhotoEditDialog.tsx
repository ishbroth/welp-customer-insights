
import { Crop, RotateCcw, RotateCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface PhotoEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  avatarPreview: string | null;
  rotation: number;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onSave: () => void;
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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            <Button onClick={onSave}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoEditDialog;
