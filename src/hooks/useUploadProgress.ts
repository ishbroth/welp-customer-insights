
import { useState } from "react";

export const useUploadProgress = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isUploadComplete, setIsUploadComplete] = useState(false);

  const startUpload = (totalPhotos: number) => {
    setIsUploading(true);
    setUploadProgress(0);
    setCurrentPhotoIndex(0);
    setIsUploadComplete(false);
  };

  const updateProgress = (photoIndex: number, totalPhotos: number) => {
    setCurrentPhotoIndex(photoIndex + 1);
    const progress = totalPhotos > 0 ? ((photoIndex + 1) / totalPhotos) * 100 : 100;
    setUploadProgress(progress);
  };

  const completeUpload = () => {
    setUploadProgress(100);
    setIsUploadComplete(true);
    
    // Hide the dialog after a brief delay
    setTimeout(() => {
      setIsUploading(false);
      setIsUploadComplete(false);
    }, 2000);
  };

  const resetUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setCurrentPhotoIndex(0);
    setIsUploadComplete(false);
  };

  return {
    isUploading,
    uploadProgress,
    currentPhotoIndex,
    isUploadComplete,
    startUpload,
    updateProgress,
    completeUpload,
    resetUpload,
  };
};
