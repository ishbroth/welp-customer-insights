
import { calculateStringSimilarity } from "./stringSimilarity";

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
