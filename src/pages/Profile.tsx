
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import WelcomeSection from "@/components/profile/WelcomeSection";
import ProfileStats from "@/components/profile/ProfileStats";
import BusinessVerificationSuccessPopup from "@/components/profile/BusinessVerificationSuccessPopup";

const Profile = () => {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [verificationSuccessData, setVerificationSuccessData] = useState<any>(null);
  const { toast } = useToast();

  // Check for business verification success on mount
  useEffect(() => {
    const businessVerificationSuccess = localStorage.getItem("businessVerificationSuccess");
    if (businessVerificationSuccess) {
      try {
        const successData = JSON.parse(businessVerificationSuccess);
        // Check if the data is recent (within last 5 minutes) to avoid showing old popups
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        if (successData.timestamp && successData.timestamp > fiveMinutesAgo) {
          setVerificationSuccessData(successData);
          setShowSuccessPopup(true);
        }
        // Clean up the stored data
        localStorage.removeItem("businessVerificationSuccess");
        localStorage.removeItem("pendingVerification"); // Also clean up pending verification data
      } catch (error) {
        console.error("Error parsing business verification success data:", error);
        localStorage.removeItem("businessVerificationSuccess");
      }
    }
  }, []);

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
    setVerificationSuccessData(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ea384c]"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex">
        <ProfileSidebar isOpen={sidebarOpen} toggle={toggleSidebar} />
        <div className="flex-grow p-8 md:ml-0">
          <WelcomeSection />
          <ProfileStats />
        </div>
      </main>
      <Footer />
      
      {/* Business Verification Success Popup */}
      {showSuccessPopup && verificationSuccessData && (
        <BusinessVerificationSuccessPopup
          isOpen={showSuccessPopup}
          onClose={handleCloseSuccessPopup}
          businessName={verificationSuccessData.businessName}
          licenseVerificationResult={verificationSuccessData.licenseVerificationResult}
        />
      )}
    </div>
  );
};

export default Profile;
