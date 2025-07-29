import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCleanupDuplicates = () => {
  const { toast } = useToast();

  const removeDuplicateResponses = async (reviewId: string) => {
    try {
      // Get all responses for this review
      const { data: responses, error } = await supabase
        .from('responses')
        .select('id, author_id, created_at, content')
        .eq('review_id', reviewId)
        .order('created_at', { ascending: true });

      if (error || !responses) {
        console.error('Error fetching responses for cleanup:', error);
        return false;
      }

      // Group consecutive responses by the same author
      const duplicatesToRemove: string[] = [];
      let lastAuthorId: string | null = null;
      let consecutiveCount = 0;

      for (const response of responses) {
        if (response.author_id === lastAuthorId) {
          consecutiveCount++;
          // Keep the first response, mark subsequent ones for removal
          if (consecutiveCount > 1) {
            duplicatesToRemove.push(response.id);
          }
        } else {
          lastAuthorId = response.author_id;
          consecutiveCount = 1;
        }
      }

      // Remove duplicates if any found
      if (duplicatesToRemove.length > 0) {
        console.log(`🧹 Removing ${duplicatesToRemove.length} duplicate responses`);
        
        const { error: deleteError } = await supabase
          .from('responses')
          .delete()
          .in('id', duplicatesToRemove);

        if (deleteError) {
          console.error('Error removing duplicate responses:', deleteError);
          return false;
        }

        toast({
          title: "Cleaned up duplicate responses",
          description: `Removed ${duplicatesToRemove.length} duplicate responses.`,
        });

        return true;
      }

      return false; // No duplicates found
    } catch (error) {
      console.error('Error during duplicate cleanup:', error);
      return false;
    }
  };

  return { removeDuplicateResponses };
};
