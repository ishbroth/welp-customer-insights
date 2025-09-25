// Test utility to help debug associate search functionality
// This can be run in the browser console to create test data

export const createTestReviewWithAssociates = async () => {
  console.log("Creating test review with associates...");

  const testReview = {
    business_id: "test-business-id",
    customer_name: "Salvatore Sardina",
    customer_address: "123 Main St",
    customer_city: "Los Angeles",
    customer_state: "CA",
    customer_zipcode: "90210",
    customer_phone: "555-1234",
    rating: 5,
    content: "Great service!",
    associates: [
      { firstName: "Andrew", lastName: "Hurder" },
      { firstName: "John", lastName: "Smith" }
    ]
  };

  console.log("Test review data:", testReview);

  // This would need to be inserted via Supabase in the actual app
  return testReview;
};

export const debugAssociateSearch = (searchParams: any) => {
  console.log("=== ASSOCIATE SEARCH DEBUG ===");
  console.log("Search parameters:", searchParams);
  console.log("firstName:", searchParams.firstName);
  console.log("lastName:", searchParams.lastName);

  // Test the associate matching logic
  const testAssociates = [
    { firstName: "Andrew", lastName: "Hurder" },
    { firstName: "John", lastName: "Smith" }
  ];

  const fullName = [searchParams.firstName, searchParams.lastName].filter(Boolean).join(' ').toLowerCase();
  console.log("Full name search:", fullName);

  const matchingAssociates = testAssociates.filter(associate => {
    const associateFirstName = (associate.firstName || '').toLowerCase();
    const associateLastName = (associate.lastName || '').toLowerCase();
    const associateFullName = `${associateFirstName} ${associateLastName}`.trim();

    // Check for matches
    const firstNameMatch = !searchParams.firstName || associateFirstName.includes(searchParams.firstName.toLowerCase());
    const lastNameMatch = !searchParams.lastName || associateLastName.includes(searchParams.lastName.toLowerCase());
    const fullNameMatch = associateFullName.includes(fullName);

    console.log(`Testing associate ${associate.firstName} ${associate.lastName}:`);
    console.log(`  - First name match: ${firstNameMatch}`);
    console.log(`  - Last name match: ${lastNameMatch}`);
    console.log(`  - Full name match: ${fullNameMatch}`);

    return firstNameMatch && lastNameMatch || fullNameMatch;
  });

  console.log("Matching associates:", matchingAssociates);
  return matchingAssociates;
};

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).createTestReviewWithAssociates = createTestReviewWithAssociates;
  (window as any).debugAssociateSearch = debugAssociateSearch;
}