
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CustomerProfileView from "@/components/customer/CustomerProfileView";
import ReviewsList from "@/components/search/ReviewsList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CustomerProfile = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [customerProfile, setCustomerProfile] = useState<any | null>(null);
  const [customerReviews, setCustomerReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only business users can view customer profiles
    if (!currentUser || (currentUser.type !== 'business' && currentUser.type !== 'admin')) {
      toast({
        title: "Access Denied",
        description: "You need to be logged in as a business to view customer profiles.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    const fetchCustomerProfile = async () => {
      if (!customerId) return;
      
      setIsLoading(true);
      
      try {
        // Get customer profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', customerId)
          .eq('type', 'customer')
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        if (!profileData) {
          toast({
            title: "Customer Not Found",
            description: "The customer profile you're looking for does not exist.",
            variant: "destructive",
          });
          navigate('/search');
          return;
        }
        
        setCustomerProfile(profileData);
        
        // Get reviews for this customer
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            id, 
            rating, 
            content, 
            created_at,
            business_id,
            profiles!business_id(name)
          `)
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });
          
        if (reviewsError) {
          throw reviewsError;
        }
        
        // Format the reviews data
        const formattedReviews = reviewsData ? reviewsData.map(review => ({
          id: review.id,
          rating: review.rating,
          content: review.content,
          date: review.created_at,
          reviewerId: review.business_id,
          reviewerName: review.profiles?.name || "Anonymous Business"
        })) : [];
        
        setCustomerReviews(formattedReviews);
        
      } catch (error: any) {
        console.error("Error fetching customer profile:", error);
        toast({
          title: "Error",
          description: "Failed to load customer profile. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomerProfile();
  }, [customerId, currentUser, navigate, toast]);

  // Check if user has access to full reviews
  const hasFullAccess = (customerId: string) => {
    // Business users always have full access
    return true;
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-gray-500">Loading customer profile...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!customerProfile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-2">Customer Not Found</h2>
              <p className="text-gray-600 mb-6">The customer profile you're looking for does not exist or you don't have permission to view it.</p>
              <Button onClick={handleGoBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <Button 
            variant="outline"
            className="mb-6" 
            onClick={handleGoBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Results
          </Button>
          
          <CustomerProfileView
            customerId={customerId || ''}
            firstName={customerProfile.first_name || ''}
            lastName={customerProfile.last_name || ''}
            phone={customerProfile.phone || ''}
            address={customerProfile.address || ''}
            city={customerProfile.city || ''}
            state={customerProfile.state || ''}
            zipCode={customerProfile.zipcode || ''}
            avatar={customerProfile.avatar || ''}
            bio={customerProfile.bio || ''}
          />
          
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
            {customerReviews.length > 0 ? (
              <ReviewsList 
                customerId={customerId || ''}
                reviews={customerReviews}
                hasFullAccess={hasFullAccess}
              />
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No reviews available for this customer yet.</p>
                <Link 
                  to={`/review/new?firstName=${encodeURIComponent(customerProfile.first_name || '')}&lastName=${encodeURIComponent(customerProfile.last_name || '')}&phone=${encodeURIComponent(customerProfile.phone || '')}&address=${encodeURIComponent(customerProfile.address || '')}&city=${encodeURIComponent(customerProfile.city || '')}&zipCode=${encodeURIComponent(customerProfile.zipcode || '')}`}
                  className="mt-4 inline-block"
                >
                  <Button>
                    Write a Review
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerProfile;
