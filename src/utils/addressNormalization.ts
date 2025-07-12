
export const normalizeAddress = (address: string): string => {
  if (!address) return '';
  
  // Basic address normalization
  return address
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\b(Street|St\.?)\b/gi, 'St')
    .replace(/\b(Avenue|Ave\.?)\b/gi, 'Ave')
    .replace(/\b(Boulevard|Blvd\.?)\b/gi, 'Blvd')
    .replace(/\b(Drive|Dr\.?)\b/gi, 'Dr')
    .replace(/\b(Lane|Ln\.?)\b/gi, 'Ln')
    .replace(/\b(Road|Rd\.?)\b/gi, 'Rd')
    .replace(/\b(Court|Ct\.?)\b/gi, 'Ct')
    .replace(/\b(Place|Pl\.?)\b/gi, 'Pl')
    .replace(/\b(Circle|Cir\.?)\b/gi, 'Cir')
    .replace(/\b(Way|Wy\.?)\b/gi, 'Way');
};

export const compareAddresses = (address1: string, address2: string, threshold: number = 0.8): boolean => {
  if (!address1 || !address2) return false;
  
  // Normalize both addresses
  const normalized1 = normalizeAddress(address1.toLowerCase());
  const normalized2 = normalizeAddress(address2.toLowerCase());
  
  // Simple string similarity comparison
  const similarity = calculateStringSimilarity(normalized1, normalized2);
  return similarity >= threshold;
};

// Simple string similarity calculation using Levenshtein distance
const calculateStringSimilarity = (str1: string, str2: string): number => {
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
