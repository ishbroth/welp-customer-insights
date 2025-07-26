export const LICENSE_TYPES = [
  "EIN",
  "Contractors",
  "Law/Legal", 
  "Liquor Licenses",
  "Medical/Dental",
  "Real Estate",
  "Vendors/Sellers"
].sort((a, b) => {
  // Keep EIN first, then sort the rest
  if (a === "EIN") return -1;
  if (b === "EIN") return 1;
  return a.localeCompare(b);
});

export const BUSINESS_CATEGORIES = [
  "Automotive", "Beauty & Wellness", "Construction & Contractors", "Education", 
  "Entertainment", "Finance & Insurance", "Food & Beverage", "Healthcare", 
  "Home & Garden", "Legal Services", "Manufacturing", "Professional Services", 
  "Real Estate", "Retail", "Technology", "Transportation", "Other"
].sort();

export const BUSINESS_SUBCATEGORIES = [
  "Auto Repair", "Car Dealership", "Hair Salon", "Spa", "Fitness Center", 
  "General Contractor", "Electrician", "Plumber", "HVAC", "Roofing", 
  "Painter", "Landscaping", "Flooring", "Carpentry", "Masonry", "Concrete",
  "Drywall", "Insulation", "Windows & Doors", "Kitchen & Bath Remodeling",
  "School", "Tutoring", "Restaurant", "Bar", "Catering", "Doctor", 
  "Dentist", "Veterinarian", "Law Firm", "Accounting", "Consulting", 
  "Real Estate Agent", "Property Management", "Retail Store", "E-commerce", 
  "Software Development", "IT Services", "Other"
].sort();
