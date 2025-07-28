
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

export const getFirstThreeLetters = (text: string): string => {
  return text.substring(0, 3) + '...';
};
