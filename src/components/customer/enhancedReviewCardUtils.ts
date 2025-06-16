
export const getBusinessInitials = (reviewerName?: string) => {
  if (reviewerName) {
    const names = reviewerName.split(' ');
    return names.map(name => name[0]).join('').toUpperCase().slice(0, 2);
  }
  return "B";
};

export const getCustomerInitials = (customerName?: string) => {
  if (customerName) {
    const names = customerName.split(' ');
    return names.map(name => name[0]).join('').toUpperCase().slice(0, 2);
  }
  return "C";
};

export const getFirstThreeWords = (text: string): string => {
  const words = text.split(' ');
  const firstThree = words.slice(0, 3).join(' ');
  return `${firstThree}${words.length > 3 ? '...' : ''}`;
};
