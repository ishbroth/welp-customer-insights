/**
 * Formats a customer name with nickname in the format: FirstName "Nickname" LastName
 * @param fullName - The full customer name (e.g., "Salvatore Sardina")
 * @param nickname - The customer's nickname (e.g., "Sal")
 * @returns Formatted name with nickname (e.g., 'Salvatore "Sal" Sardina')
 */
export const formatCustomerNameWithNickname = (fullName: string, nickname?: string | null): string => {
  if (!nickname || nickname.trim() === '') {
    return fullName;
  }

  const trimmedNickname = nickname.trim();
  const nameParts = fullName.trim().split(/\s+/);

  if (nameParts.length === 0) {
    return fullName;
  }

  if (nameParts.length === 1) {
    // Only first name, add nickname after
    return `${nameParts[0]} "${trimmedNickname}"`;
  }

  // Multiple name parts - insert nickname after first name
  const firstName = nameParts[0];
  const restOfName = nameParts.slice(1).join(' ');

  return `${firstName} "${trimmedNickname}" ${restOfName}`;
};

/**
 * Extracts initials from a name, ignoring nicknames in quotes
 * Returns first letter of first name and first letter of last name only
 * @param name - Full name which may include nickname in quotes (e.g., 'Salvatore "Sal" Sardina')
 * @returns Two-letter initials (e.g., "SS")
 */
export const getNameInitials = (name: string): string => {
  if (!name || name.trim() === '') {
    return "C";
  }

  // Remove anything in quotes (nicknames) and extra whitespace
  const nameWithoutNickname = name.replace(/"[^"]*"/g, '').replace(/\s+/g, ' ').trim();
  
  // Split into parts
  const nameParts = nameWithoutNickname.split(' ').filter(part => part.length > 0);

  if (nameParts.length === 0) {
    return "C";
  }

  if (nameParts.length === 1) {
    // Only one name part - take first letter
    return nameParts[0][0].toUpperCase();
  }

  // Take first letter of first name and first letter of last name
  const firstInitial = nameParts[0][0].toUpperCase();
  const lastInitial = nameParts[nameParts.length - 1][0].toUpperCase();

  return firstInitial + lastInitial;
};