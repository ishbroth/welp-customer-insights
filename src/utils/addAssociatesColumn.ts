import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

const utilLogger = logger.withContext('addAssociatesColumn');

export const addAssociatesColumnToDatabase = async () => {
  try {
    utilLogger.info("Adding associates column to reviews table...");

    // First check if the column already exists
    const { data: existingColumns, error: columnsError } = await supabase
      .from('reviews')
      .select('*')
      .limit(1);

    if (columnsError) {
      utilLogger.error("Error checking existing columns:", columnsError);
      return false;
    }

    // Check if associates column exists in the returned data
    if (existingColumns && existingColumns.length > 0 && 'associates' in existingColumns[0]) {
      utilLogger.info("Associates column already exists!");
      return true;
    }

    // Add the column using raw SQL
    const { error } = await supabase
      .rpc('exec_sql', {
        sql: `
          ALTER TABLE public.reviews
          ADD COLUMN IF NOT EXISTS associates JSONB DEFAULT '[]'::jsonb;

          COMMENT ON COLUMN public.reviews.associates IS 'Array of associate objects containing firstName and lastName fields';

          CREATE INDEX IF NOT EXISTS idx_reviews_associates ON public.reviews USING GIN (associates);
        `
      });

    if (error) {
      utilLogger.error("Error adding associates column:", error);
      return false;
    }

    utilLogger.info("Associates column added successfully!");
    return true;
  } catch (err) {
    utilLogger.error("Unexpected error:", err);
    return false;
  }
};

// Run this function in the browser console to add the column
(window as any).addAssociatesColumn = addAssociatesColumnToDatabase;