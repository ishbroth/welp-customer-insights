
// Array of US states for the dropdown
export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", 
  "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", 
  "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

// Business type options - with EIN/Other at top, others alphabetized
export const BUSINESS_TYPE_OPTIONS = [
  { value: "ein", label: "EIN/Other" },
  ...[ 
    { value: "auto", label: "Auto/Mechanic" },
    { value: "contractor", label: "Contractors" },
    { value: "energy", label: "Energy" },
    { value: "insurance", label: "Insurance" },
    { value: "attorney", label: "Law/Legal" },
    { value: "bar", label: "Liquor Licenses" },
    { value: "medical", label: "Medical/Dental" },
    { value: "realtor", label: "Real Estate" },
    { value: "rentals", label: "Rentals/Equipment" },
    { value: "restaurant", label: "Restaurant/Service" },
    { value: "retail", label: "Retail" },
    { value: "other", label: "Vendors/Sellers" }
  ].sort((a, b) => a.label.localeCompare(b.label))
];
