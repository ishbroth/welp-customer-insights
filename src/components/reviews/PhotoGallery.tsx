
import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Photo {
  id: string;
  photo_url: string;
  caption: string | null;
  display_order: number;
}

interface PhotoGalleryProps {
  photos: Photo[];
  hasAccess: boolean;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, hasAccess }) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  if (!hasAccess || photos.length === 0) {
    return null;
  }

  const sortedPhotos = [...photos].sort((a, b) => a.display_order - b.display_order);

  const openGallery = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closeGallery = () => {
    setSelectedPhotoIndex(null);
  };

  const goToPrevious = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < sortedPhotos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeGallery();
    } else if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  return (
    <>
      {/* Photo thumbnails */}
      <div className="mt-3">
        <div className="flex flex-wrap gap-2">
          {sortedPhotos.map((photo, index) => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.photo_url}
                alt={photo.caption || `Photo ${index + 1}`}
                className="h-20 w-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => openGallery(index)}
              />
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b opacity-0 group-hover:opacity-100 transition-opacity">
                  {photo.caption.length > 10 ? `${photo.caption.substring(0, 10)}...` : photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Full-screen gallery modal */}
      {selectedPhotoIndex !== null && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeGallery}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative max-w-4xl max-h-screen p-4" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 text-white hover:bg-white hover:bg-opacity-20 z-10"
              onClick={closeGallery}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation buttons */}
            {selectedPhotoIndex > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 z-10"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}

            {selectedPhotoIndex < sortedPhotos.length - 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 z-10"
                onClick={goToNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}

            {/* Image */}
            <img
              src={sortedPhotos[selectedPhotoIndex].photo_url}
              alt={sortedPhotos[selectedPhotoIndex].caption || `Photo ${selectedPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Caption */}
            {sortedPhotos[selectedPhotoIndex].caption && (
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded">
                  {sortedPhotos[selectedPhotoIndex].caption}
                </div>
              </div>
            )}

            {/* Photo counter */}
            <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
              {selectedPhotoIndex + 1} / {sortedPhotos.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGallery;
