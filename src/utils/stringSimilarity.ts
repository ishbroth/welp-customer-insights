
// Enhanced string similarity calculation with name-specific logic
export const calculateStringSimilarity = (str1: string, str2: string): number => {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  const maxLen = Math.max(len1, len2);
  return (maxLen - matrix[len1][len2]) / maxLen;
};

// Enhanced name similarity with first/last name component matching
export const calculateNameSimilarity = (searchName: string, customerName: string): number => {
  if (!searchName || !customerName) return 0;
  
  const searchNameLower = searchName.toLowerCase().trim();
  const customerNameLower = customerName.toLowerCase().trim();
  
  // Split both names into components
  const searchParts = searchNameLower.split(/\s+/).filter(part => part.length > 1);
  const customerParts = customerNameLower.split(/\s+/).filter(part => part.length > 1);
  
  if (searchParts.length === 0 || customerParts.length === 0) return 0;
  
  // Direct full name comparison
  const directSimilarity = calculateStringSimilarity(searchNameLower, customerNameLower);
  
  // For multi-part searches (first + last name), require component-specific matching
  if (searchParts.length >= 2 && customerParts.length >= 2) {
    // Try to match first-to-first and last-to-last specifically
    const firstToFirst = calculateStringSimilarity(searchParts[0], customerParts[0]);
    const lastToLast = calculateStringSimilarity(searchParts[searchParts.length - 1], customerParts[customerParts.length - 1]);
    
    // Both components must have reasonable similarity
    const minComponentSimilarity = 0.7;
    if (firstToFirst >= minComponentSimilarity && lastToLast >= minComponentSimilarity) {
      // Average the component similarities for a strong match
      return (firstToFirst + lastToLast) / 2;
    }
    
    // If direct comparison is very strong, allow it to override weak component matches
    if (directSimilarity >= 0.9) {
      return directSimilarity;
    }
    
    // Otherwise, this is not a valid match for multi-component names
    return 0;
  }
  
  // For single-component searches, use existing logic
  let bestComponentMatch = 0;
  for (const searchPart of searchParts) {
    for (const customerPart of customerParts) {
      const partSimilarity = calculateStringSimilarity(searchPart, customerPart);
      bestComponentMatch = Math.max(bestComponentMatch, partSimilarity);
    }
  }
  
  // Return the best of direct comparison or component matching
  return Math.max(directSimilarity, bestComponentMatch);
};
