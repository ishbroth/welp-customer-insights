
import { createClient } from '@supabase/supabase-js';

// Create a single instance of the Supabase client
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Calculate string similarity for search
export const calculateStringSimilarity = (str1: string, str2: string): number => {
  // Convert both strings to lowercase for case-insensitive comparison
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // If either string is empty, return 0
  if (s1.length === 0 || s2.length === 0) return 0;
  
  // If the strings are identical, return 1
  if (s1 === s2) return 1;
  
  // Calculate the Levenshtein distance (edit distance)
  const matrix = Array(s1.length + 1).fill(null).map(() => Array(s2.length + 1).fill(null));
  
  // Initialize the first row and column
  for (let i = 0; i <= s1.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= s2.length; j++) matrix[0][j] = j;
  
  // Fill in the rest of the matrix
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  // Calculate similarity as 1 - normalized distance
  const maxLength = Math.max(s1.length, s2.length);
  return maxLength > 0 ? 1 - matrix[s1.length][s2.length] / maxLength : 1;
}
