
import { useAuth } from "@/contexts/auth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WelcomeSection from "@/components/profile/WelcomeSection";
import ProfileSidebar from "@/components/ProfileSidebar";
import { usePostAuthRedirect } from "@/hooks/usePostAuthRedirect";
import { useState } from "react";
import { CheckCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

const ProfilePage = () => {
  const { currentUser, loading, isSubscribed, setIsSubscribed } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Handle post-auth redirections
  usePostAuthRedirect();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Extract license information
  const licenseNumber = currentUser.businessId;
  const licenseState = currentUser.state;
  const licenseType = currentUser.licenseType;
  const isBusinessAccount = currentUser.type === "business" || currentUser.type === "admin";
  
  // Check if business is verified (placeholder - would come from database)
  const isVerified = false;

  // Format the license display text
  const getLicenseDisplayText = () => {
    if (licenseType && licenseState) {
      return `${licenseType} • ${licenseState}`;
    } else if (licenseType) {
      return licenseType;
    } else if (licenseState) {
      return `Business License • ${licenseState}`;
    } else {
      return "Business License";
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row">
        <ProfileSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-8">
              <WelcomeSection />
            </div>
            
            {/* Profile Information Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-gray-900">{currentUser.name || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{currentUser.email}</p>
                    </div>
                    {currentUser.bio && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Bio</label>
                        <p className="text-gray-900">{currentUser.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    {currentUser.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-gray-900">{formatPhoneNumber(currentUser.phone)}</p>
                      </div>
                    )}
                    {currentUser.address && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="text-gray-900">
                          {currentUser.address}
                          {currentUser.city && `, ${currentUser.city}`}
                          {currentUser.state && `, ${currentUser.state}`}
                          {currentUser.zipCode && ` ${currentUser.zipCode}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {isBusinessAccount && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Business Information</h3>
                    {licenseNumber ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">License Number</label>
                          <p className="text-gray-900">{licenseNumber}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {getLicenseDisplayText()}
                          </p>
                          <div className="mt-2">
                            {isVerified ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">Verified License</span>
                              </div>
                            ) : (
                              <Link 
                                to="/verify-license" 
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Update License Information
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No license information provided</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
