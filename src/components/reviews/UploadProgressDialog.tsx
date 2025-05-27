
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle } from "lucide-react";

interface UploadProgressDialogProps {
  open: boolean;
  progress: number;
  isComplete: boolean;
  totalPhotos: number;
  currentPhoto: number;
}

const UploadProgressDialog: React.FC<UploadProgressDialogProps> = ({
  open,
  progress,
  isComplete,
  totalPhotos,
  currentPhoto,
}) => {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center space-y-4 py-6">
          {isComplete ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-500 animate-scale-in" />
              <h3 className="text-lg font-semibold">Upload Complete!</h3>
              <p className="text-sm text-gray-600">Review submitted successfully</p>
            </>
          ) : (
            <>
              <div className="relative">
                <Upload className="h-12 w-12 text-blue-500 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-lg font-semibold">Uploading Photos...</h3>
              <div className="w-full space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-gray-600">
                  {totalPhotos > 0 
                    ? `Uploading photo ${currentPhoto} of ${totalPhotos} (${Math.round(progress)}%)`
                    : "Submitting review..."
                  }
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadProgressDialog;
