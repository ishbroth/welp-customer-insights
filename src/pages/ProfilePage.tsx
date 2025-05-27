
import { useAuth } from "@/contexts/auth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WelcomeSection from "@/components/profile/WelcomeSection";
import ProfileSidebar from "@/components/ProfileSidebar";
import { usePostAuthRedirect } from "@/hooks/usePostAuthRedirect";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const { currentUser, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Handle post-auth redirections
  usePostAuthRedirect();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row">
        <ProfileSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-4xl">
            <div className="flex justify-between items-start mb-8">
              <WelcomeSection />
              <Link to="/profile/edit">
                <Button className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
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
                        <p className="text-gray-900">{currentUser.phone}</p>
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
                
                {(currentUser.type === "business" || currentUser.type === "admin") && currentUser.businessId && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Business Information</h3>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Business ID</label>
                      <p className="text-gray-900">{currentUser.businessId}</p>
                    </div>
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
