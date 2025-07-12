
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
