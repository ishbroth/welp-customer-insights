
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import ForceDeleteAccount from "@/components/debug/ForceDeleteAccount";

const DebugAccount = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only allow admin access or development mode
    if (!currentUser || currentUser.type !== 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.type !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Debug Account Management</h1>
        <ForceDeleteAccount />
      </div>
    </div>
  );
};

export default DebugAccount;
