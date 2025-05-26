
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import { Card } from "@/components/ui/card";
import { useProfileReviewsFetching } from "@/hooks/useProfileReviewsFetching";
import WelcomeSection from "@/components/profile/WelcomeSection";
import AdminDashboard from "@/components/profile/AdminDashboard";
import BusinessInfoCard from "@/components/profile/BusinessInfoCard";
import CustomerInfoCard from "@/components/profile/CustomerInfoCard";
import RateCustomerSection from "@/components/profile/RateCustomerSection";
import CustomerReviewsSection from "@/components/profile/CustomerReviewsSection";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser } = useAuth();
  
  // Fetch customer reviews using the hook
  const { customerReviews, isLoading } = useProfileReviewsFetching();

  // Handle search in "Rate a Customer" section
  const handleCustomerSearch = (searchParams: Record<string, string>) => {
    // Filter out empty values
    const filteredParams = Object.fromEntries(
      Object.entries(searchParams).filter(([_, value]) => value.trim() !== '')
    );
    
    // Check if any search parameters were provided
    if (Object.keys(filteredParams).length === 0) {
      // If no parameters, just go to the new review page
      navigate('/review/new');
      return;
    }
    
    // Build query string and navigate to search or review page
    const queryString = Object.entries(filteredParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value.trim())}`)
      .join('&');
      
    navigate(`/search?${queryString}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row">
        <ProfileSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 gap-8">
              {/* Welcome section */}
              <WelcomeSection currentUser={currentUser} />
              
              {/* Admin Dashboard Panel */}
              {currentUser?.type === "admin" && <AdminDashboard />}

              {/* Business Owner Profile Card - for business owners only */}
              {currentUser?.type === "business" && (
                <BusinessInfoCard currentUser={currentUser} />
              )}

              {/* Customer Profile Information Section - for customers only */}
              {currentUser?.type === "customer" && (
                <CustomerInfoCard currentUser={currentUser} />
              )}
              
              {/* Search section - only show for business users */}
              {currentUser?.type === "business" && (
                <RateCustomerSection onCustomerSearch={handleCustomerSearch} />
              )}
              
              {/* Customer Reviews Section - for customers only */}
              {currentUser?.type === "customer" && (
                <CustomerReviewsSection 
                  customerReviews={customerReviews} 
                  isLoading={isLoading} 
                />
              )}
              
              {/* No reviews message for customers */}
              {currentUser?.type === "customer" && customerReviews.length === 0 && !isLoading && (
                <Card className="p-6 text-center">
                  <p className="text-gray-500 mb-4">
                    No businesses have written reviews about you yet.
                  </p>
                  <p className="text-sm text-gray-600">
                    As you interact with more businesses on our platform, reviews will appear here.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
