
import { supabase } from "@/integrations/supabase/client";

export interface PhotoUpload {
  file: File;
  caption: string;
  preview: string;
  isExisting?: boolean; // Flag to indicate if this is an existing photo
  existingId?: string; // ID of existing photo record
}

export interface UploadedPhoto {
  photo_url: string;
  caption: string | null;
  display_order: number;
}

export const uploadReviewPhotos = async (
  photos: PhotoUpload[],
  reviewId: string,
  userId: string,
  onProgress?: (photoIndex: number, totalPhotos: number) => void
): Promise<UploadedPhoto[]> => {
  const uploadedPhotos: UploadedPhoto[] = [];
  
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    
    // If this is an existing photo, just add it to the results without uploading
    if (photo.isExisting) {
      uploadedPhotos.push({
        photo_url: photo.preview, // Use the existing URL
        caption: photo.caption || null,
        display_order: i
      });
    } else {
      // Upload new photo
      const fileExt = photo.file.name.split('.').pop();
      const fileName = `${userId}/${reviewId}/${Date.now()}-${i}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('review-photos')
        .upload(fileName, photo.file);

      if (uploadError) {
        console.error("Error uploading photo:", uploadError);
        throw new Error(`Failed to upload photo: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('review-photos')
        .getPublicUrl(fileName);

      uploadedPhotos.push({
        photo_url: publicUrl,
        caption: photo.caption || null,
        display_order: i
      });
    }

    // Call progress callback if provided
    if (onProgress) {
      onProgress(i, photos.length);
    }
  }

  return uploadedPhotos;
};

export const savePhotoRecords = async (
  uploadedPhotos: UploadedPhoto[],
  reviewId: string,
  isEditing: boolean = false
): Promise<void> => {
  // If editing, first delete existing photo records to avoid duplicates
  if (isEditing) {
    const { error: deleteError } = await supabase
      .from('review_photos')
      .delete()
      .eq('review_id', reviewId);

    if (deleteError) {
      console.error("Error deleting existing photo records:", deleteError);
      throw new Error(`Failed to delete existing photo records: ${deleteError.message}`);
    }
  }

  // Insert new photo records
  const { error: photoError } = await supabase
    .from('review_photos')
    .insert(
      uploadedPhotos.map(photo => ({
        review_id: reviewId,
        ...photo
      }))
    );

  if (photoError) {
    console.error("Error saving photo records:", photoError);
    throw new Error(`Failed to save photo records: ${photoError.message}`);
  }
};
