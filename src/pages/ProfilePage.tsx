import { useAuth } from "@/contexts/auth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WelcomeSection from "@/components/profile/WelcomeSection";
import ProfileSidebar from "@/components/ProfileSidebar";
import { usePostAuthRedirect } from "@/hooks/usePostAuthRedirect";
import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { formatPhoneNumber } from "@/utils/phoneFormatter";
import { supabase } from "@/integrations/supabase/client";
import { BUSINESS_TYPE_OPTIONS } from "@/components/signup/businessFormData";

const ProfilePage = () => {
  const { currentUser, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [licenseType, setLicenseType] = useState<string>("");
  
  // Handle post-auth redirections
  usePostAuthRedirect();

  // Fetch license type from business_info table
  useEffect(() => {
    const fetchLicenseType = async () => {
      if (!currentUser?.id || currentUser?.type !== "business") return;

      try {
        const { data: businessData, error } = await supabase
          .from('business_info')
          .select('license_type')
          .eq('id', currentUser.id)
          .single();

        if (error) {
          console.error("Error fetching license type from business_info:", error);
          return;
        }

        console.log("Fetched business license type from business_info:", businessData?.license_type);
        setLicenseType(businessData?.license_type || "");
      } catch (error) {
        console.error("Error in fetchLicenseType:", error);
      }
    };

    fetchLicenseType();
  }, [currentUser?.id, currentUser?.type]);

  // Show loading only if auth is still loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Extract license information
  const licenseNumber = currentUser.businessId;
  const licenseState = currentUser.state;
  
  // Debug the mapping
  console.log("=== LICENSE TYPE DEBUGGING ===");
  console.log("BUSINESS_TYPE_OPTIONS:", BUSINESS_TYPE_OPTIONS);
  console.log("licenseType from business_info:", licenseType);
  console.log("typeof licenseType:", typeof licenseType);
  
  // Map the stored license type value to its display label
  const licenseTypeOption = BUSINESS_TYPE_OPTIONS.find(option => {
    console.log(`Comparing option.value (${option.value}) with licenseType (${licenseType})`);
    return option.value === licenseType;
  });
  
  const licenseTypeLabel = licenseTypeOption?.label || "";
  
  const isBusinessAccount = currentUser.type === "business" || currentUser.type === "admin";
  
  // Check if business is verified (placeholder - would come from database)
  const isVerified = false;

  console.log("ProfilePage - currentUser:", currentUser);
  console.log("ProfilePage - licenseType from business_info:", licenseType);
  console.log("ProfilePage - licenseNumber (businessId):", licenseNumber);
  console.log("ProfilePage - found licenseTypeOption:", licenseTypeOption);
  console.log("ProfilePage - licenseTypeLabel to display:", licenseTypeLabel);

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                    {licenseTypeLabel || licenseNumber || licenseState ? (
                      <div className="space-y-3">
                        {licenseTypeLabel && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">License Type</label>
                            <p className="text-gray-900">{licenseTypeLabel}</p>
                          </div>
                        )}
                        {licenseNumber && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">License Number</label>
                            <p className="text-gray-900">{licenseNumber}</p>
                          </div>
                        )}
                        {licenseState && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">License State</label>
                            <p className="text-gray-900">{licenseState}</p>
                          </div>
                        )}
                        <div className="mt-2">
                          {isVerified && (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">Verified License</span>
                            </div>
                          )}
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
