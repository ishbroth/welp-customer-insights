
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

// Business type options - alphabetized and concise
export const BUSINESS_TYPE_OPTIONS = [
  { value: "contractor", label: "Contractors" },
  { value: "attorney", label: "Law/Legal" },
  { value: "bar", label: "Liquor Licenses" },
  { value: "medical", label: "Medical/Dental" },
  { value: "realtor", label: "Real Estate" },
  { value: "other", label: "Vendors/Sellers" }
].sort((a, b) => a.label.localeCompare(b.label));
