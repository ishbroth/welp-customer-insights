
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import VerificationFormWrapper from "@/components/verification/VerificationFormWrapper";
import WelpLoadingIcon from "@/components/ui/WelpLoadingIcon";

const VerifyLicense = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-welp-primary">
        <main className="flex-grow flex items-center justify-center">
          <WelpLoadingIcon size={120} />
        </main>
      </div>
    );
  }

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button 
            variant="outline"
            className="mb-6" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <VerificationFormWrapper 
            currentUser={currentUser}
            onNavigate={navigate}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyLicense;
