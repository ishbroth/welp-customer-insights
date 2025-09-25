import { supabase } from "@/integrations/supabase/client";

export const addAssociatesColumnToDatabase = async () => {
  try {
    console.log("Adding associates column to reviews table...");

    // First check if the column already exists
    const { data: existingColumns, error: columnsError } = await supabase
      .from('reviews')
      .select('*')
      .limit(1);

    if (columnsError) {
      console.error("Error checking existing columns:", columnsError);
      return false;
    }

    // Check if associates column exists in the returned data
    if (existingColumns && existingColumns.length > 0 && 'associates' in existingColumns[0]) {
      console.log("Associates column already exists!");
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
      console.error("Error adding associates column:", error);
      return false;
    }

    console.log("Associates column added successfully!");
    return true;
  } catch (err) {
    console.error("Unexpected error:", err);
    return false;
  }
};

// Run this function in the browser console to add the column
(window as any).addAssociatesColumn = addAssociatesColumnToDatabase;