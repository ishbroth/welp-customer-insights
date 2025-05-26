
import { supabase } from "@/integrations/supabase/client";

export const fetchCustomerReviewsFromDB = async (currentUser: any) => {
  console.log("=== FETCHING REVIEWS FOR CUSTOMER ===");
  console.log("Customer ID:", currentUser.id);
  
  // First try to fetch by customer_id
  const { data: directReviews, error: directError } = await supabase
    .from('reviews')
    .select(`
      id, 
      rating, 
      content, 
      created_at,
      business_id
    `)
    .eq('customer_id', currentUser.id);

  if (directError) {
    console.error("Error fetching direct reviews:", directError);
  }

  console.log("Direct reviews found:", directReviews?.length || 0);
  let allReviews = directReviews || [];

  // If no direct reviews and we have a current user with a name, search by name
  if ((!directReviews || directReviews.length === 0) && currentUser?.name) {
    console.log("Searching by customer name:", currentUser.name);
    
    const { data: nameReviews, error: nameError } = await supabase
      .from('reviews')
      .select(`
        id, 
        rating, 
        content, 
        created_at,
        business_id
      `)
      .ilike('customer_name', `%${currentUser.name}%`);

    if (nameError) {
      console.error("Error fetching reviews by name:", nameError);
    } else {
      console.log("Reviews found by name:", nameReviews?.length || 0);
      allReviews = [...allReviews, ...(nameReviews || [])];
    }
  }

  // Remove duplicates based on review ID
  const uniqueReviews = allReviews.filter((review, index, self) => 
    index === self.findIndex(r => r.id === review.id)
  );

  console.log("Total unique reviews:", uniqueReviews.length);
  return uniqueReviews;
};
