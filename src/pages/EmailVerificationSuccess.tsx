
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const EmailVerificationSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const accountType = searchParams.get('type') || 'customer';
  const userEmail = searchParams.get('email') || '';

  useEffect(() => {
    // For both customer and business accounts, redirect to profile after delay
    setTimeout(() => {
      navigate('/profile');
    }, 3000);
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="container mx-auto flex-grow flex items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Email Verified Successfully!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your account has been created successfully.
          </p>

          <p className="text-sm text-gray-500">
            Redirecting to your profile...
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationSuccess;
