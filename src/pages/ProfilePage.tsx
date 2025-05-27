
import { useAuth } from "@/contexts/auth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileForm from "@/components/profile/ProfileForm";
import WelcomeSection from "@/components/profile/WelcomeSection";
import { usePostAuthRedirect } from "@/hooks/usePostAuthRedirect";

const ProfilePage = () => {
  const { currentUser, loading } = useAuth();
  
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
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <WelcomeSection />
            <ProfileForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
