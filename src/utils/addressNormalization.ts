
import { calculateStringSimilarity } from "./stringSimilarity";

/**
 * Normalizes an address string for better matching by:
 * - Converting to lowercase
 * - Expanding common abbreviations
 * - Removing extra spaces and punctuation
 */
export const normalizeAddress = (address: string): string => {
  if (!address) return '';
  
  let normalized = address.toLowerCase().trim();
  
  // Common address abbreviations mapping
  const abbreviations: { [key: string]: string } = {
    // Street types
    'st\\.?': 'street',
    'ave\\.?': 'avenue',
    'blvd\\.?': 'boulevard',
    'dr\\.?': 'drive',
    'rd\\.?': 'road',
    'ct\\.?': 'court',
    'cir\\.?': 'circle',
    'ln\\.?': 'lane',
    'pl\\.?': 'place',
    'pkwy\\.?': 'parkway',
    'hwy\\.?': 'highway',
    'sq\\.?': 'square',
    'ter\\.?': 'terrace',
    'way\\.?': 'way',
    
    // Directionals
    'n\\.?': 'north',
    's\\.?': 'south',
    'e\\.?': 'east',
    'w\\.?': 'west',
    'ne\\.?': 'northeast',
    'nw\\.?': 'northwest',
    'se\\.?': 'southeast',
    'sw\\.?': 'southwest',
    
    // Unit types
    'apt\\.?': 'apartment',
    'ste\\.?': 'suite',
    'unit\\.?': 'unit',
    'bldg\\.?': 'building',
    '#': 'number'
  };
  
  // Apply abbreviation expansions
  for (const [abbrev, full] of Object.entries(abbreviations)) {
    const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
    normalized = normalized.replace(regex, full);
  }
  
  // Remove extra punctuation and normalize spaces
  normalized = normalized.replace(/[.,;]/g, ' ');
  normalized = normalized.replace(/\s+/g, ' ');
  normalized = normalized.trim();
  
  return normalized;
};

/**
 * Compares two addresses with fuzzy matching and normalization
 */
export const compareAddresses = (address1: string, address2: string, threshold: number = 0.8): boolean => {
  if (!address1 || !address2) return false;
  
  const normalized1 = normalizeAddress(address1);
  const normalized2 = normalizeAddress(address2);
  
  // Check exact match first (fastest)
  if (normalized1 === normalized2) return true;
  
  // Check if one contains the other (common for partial addresses)
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return true;
  }
  
  // Use fuzzy string matching
  const similarity = calculateStringSimilarity(normalized1, normalized2);
  return similarity >= threshold;
};

/**
 * Extracts the core address components (street number + street name) for better matching
 */
export const extractCoreAddress = (address: string): string => {
  if (!address) return '';
  
  const normalized = normalizeAddress(address);
  
  // Try to extract just the street number and name, removing unit info
  const parts = normalized.split(/\s+/);
  const coreAddress = [];
  
  for (const part of parts) {
    // Stop at common unit indicators
    if (['apartment', 'suite', 'unit', 'number', '#'].includes(part)) {
      break;
    }
    coreAddress.push(part);
  }
  
  return coreAddress.join(' ');
};
