
import { supabase } from "@/integrations/supabase/client";

export interface PhotoUpload {
  file: File;
  caption: string;
  preview: string;
}

export interface UploadedPhoto {
  photo_url: string;
  caption: string | null;
  display_order: number;
}

export const uploadReviewPhotos = async (
  photos: PhotoUpload[],
  reviewId: string,
  userId: string
): Promise<UploadedPhoto[]> => {
  const uploadedPhotos: UploadedPhoto[] = [];
  
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
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

  return uploadedPhotos;
};

export const savePhotoRecords = async (
  uploadedPhotos: UploadedPhoto[],
  reviewId: string
): Promise<void> => {
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
