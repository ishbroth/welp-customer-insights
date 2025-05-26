
/**
 * Calculates similarity between two strings (for fuzzy matching)
 * 
 * @param str1 First string to compare
 * @param str2 Second string to compare
 * @returns A value between 0 and 1, where 1 means identical strings
 */
export const calculateStringSimilarity = (str1: string, str2: string): number => {
  // Convert both strings to lowercase for case-insensitive comparison
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  // If either string is empty, return 0
  if (s1.length === 0 || s2.length === 0) return 0;
  
  // If the strings are identical, return 1
  if (s1 === s2) return 1;
  
  // Check for substring matches first (faster)
  if (s1.includes(s2) || s2.includes(s1)) {
    return Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length);
  }
  
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
};

/**
 * Checks if two strings are similar enough to be considered a match
 * 
 * @param str1 First string to compare
 * @param str2 Second string to compare
 * @param threshold Minimum similarity score (0-1) to consider a match
 * @returns Boolean indicating if strings are similar enough
 */
export const areStringsSimilar = (str1: string, str2: string, threshold: number = 0.7): boolean => {
  return calculateStringSimilarity(str1, str2) >= threshold;
};

/**
 * Finds the best matching string from an array of candidates
 * 
 * @param target The string to match against
 * @param candidates Array of candidate strings
 * @param threshold Minimum similarity score to consider
 * @returns The best matching string or null if no good match found
 */
export const findBestMatch = (target: string, candidates: string[], threshold: number = 0.7): string | null => {
  let bestMatch = null;
  let bestScore = threshold;
  
  for (const candidate of candidates) {
    const score = calculateStringSimilarity(target, candidate);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = candidate;
    }
  }
  
  return bestMatch;
};
