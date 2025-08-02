
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

// Enhanced name similarity that checks against individual name parts
export const calculateNameSimilarity = (searchName: string, customerName: string): number => {
  if (!searchName || !customerName) return 0;
  
  const searchNameLower = searchName.toLowerCase().trim();
  const customerNameLower = customerName.toLowerCase().trim();
  
  // Direct comparison first
  const directSimilarity = calculateStringSimilarity(searchNameLower, customerNameLower);
  
  // Split customer name into parts and check against each
  const customerParts = customerNameLower.split(/\s+/).filter(part => part.length > 1);
  
  let bestPartSimilarity = 0;
  for (const part of customerParts) {
    const partSimilarity = calculateStringSimilarity(searchNameLower, part);
    bestPartSimilarity = Math.max(bestPartSimilarity, partSimilarity);
  }
  
  // Return the better of direct comparison or best part match
  return Math.max(directSimilarity, bestPartSimilarity);
};
