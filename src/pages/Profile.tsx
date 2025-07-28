
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

  // Check for business verification success on mount with improved detection
  useEffect(() => {
    const checkForBusinessVerificationSuccess = () => {
      console.log("🔍 Checking for business verification success...");
      
      const businessVerificationSuccess = localStorage.getItem("businessVerificationSuccess");
      console.log("📊 Raw localStorage data:", businessVerificationSuccess);
      
      if (businessVerificationSuccess) {
        try {
          const successData = JSON.parse(businessVerificationSuccess);
          console.log("📋 Parsed success data:", successData);
          
          // Check if the data is recent (within last 10 minutes) to avoid showing old popups
          const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
          if (successData.timestamp && successData.timestamp > tenMinutesAgo) {
            console.log("✅ Business verification success data is recent, showing popup");
            setVerificationSuccessData(successData);
            setShowSuccessPopup(true);
          } else {
            console.log("⏰ Business verification success data is too old, skipping popup");
          }
          
          // Clean up the stored data
          localStorage.removeItem("businessVerificationSuccess");
          localStorage.removeItem("pendingVerification"); // Also clean up pending verification data
        } catch (error) {
          console.error("❌ Error parsing business verification success data:", error);
          localStorage.removeItem("businessVerificationSuccess");
        }
      } else {
        console.log("📭 No business verification success data found");
      }
    };

    // Check immediately if currentUser is already available
    if (currentUser) {
      checkForBusinessVerificationSuccess();
    }

    // Also check after a small delay to handle async loading
    const timeoutId = setTimeout(checkForBusinessVerificationSuccess, 500);
    
    return () => clearTimeout(timeoutId);
  }, [currentUser]);

  const handleCloseSuccessPopup = () => {
    console.log("🔄 Closing business verification success popup");
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
