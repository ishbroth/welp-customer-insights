
// Get label for the license input based on selected business type
export const getLicenseLabel = (businessType: string): string => {
  switch (businessType) {
    case "ein":
      return "EIN";
    case "contractor":
      return "Contractor License Number";
    case "restaurant":
      return "Restaurant License Number";
    case "bar":
      return "Liquor License Number";
    case "attorney":
      return "Bar Association Number";
    case "realtor":
      return "Real Estate License Number";
    case "medical":
      return "Medical License Number";
    case "auto":
      return "Auto Repair License Number";
    case "insurance":
      return "Insurance License Number";
    case "energy":
      return "Energy License Number";
    case "rentals":
      return "Equipment Rental License";
    case "retail":
      return "Retail License Number";
    default:
      return "License Number / EIN";
  }
};

// Get guidance message based on selected state and business type
export const getGuidanceMessage = (businessState: string, businessType: string): string => {
  if (!businessState || !businessType || businessType === "ein") {
    return "";
  }
  
  switch(businessType) {
    case "contractor":
      if (businessState === "California") {
        return "California contractor licenses typically have 6-8 digits";
      } else if (businessState === "Florida") {
        return "Florida contractor licenses typically start with CBC, CCC, CFC, CGC, or CRC followed by 6 digits";
      }
      break;
    case "bar":
      if (businessState === "California") {
        return "California liquor licenses typically have 6 digits";
      } else if (businessState === "New York") {
        return "New York liquor licenses typically have 8 digits";
      }
      break;
    case "attorney":
      if (businessState === "California") {
        return "California bar numbers typically have 6 digits";
      } else if (businessState === "New York") {
        return "New York bar numbers typically have 7 digits";
      }
      break;
    case "realtor":
      if (businessState === "Florida") {
        return "Florida real estate licenses typically start with BK or SL followed by 7 digits";
      }
      break;
    case "auto":
      if (businessState === "California") {
        return "California auto repair licenses typically have 6-8 digits";
      }
      break;
    case "restaurant":
      if (businessState === "California") {
        return "California food service licenses typically have 6-8 digits";
      }
      break;
  }
  
  return "";
};
