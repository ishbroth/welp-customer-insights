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