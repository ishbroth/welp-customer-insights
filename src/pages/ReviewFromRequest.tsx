import { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { logger } from "@/utils/logger";
import WelpLoadingIcon from "@/components/ui/WelpLoadingIcon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const requestLogger = logger.withContext('ReviewFromRequest');

const ReviewFromRequest = () => {
  const [searchParams] = useSearchParams();
  const { currentUser, loading } = useAuth();
  const [tokenData, setTokenData] = useState<{
    customerId: string;
    customerEmail: string;
    timestamp: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('Invalid or missing request token');
      return;
    }

    try {
      // Decode the base64 token
      const decoded = atob(token);
      const [customerId, customerEmail, timestampStr] = decoded.split('|');
      const timestamp = parseInt(timestampStr);

      // Validate token data
      if (!customerId || !customerEmail || isNaN(timestamp)) {
        throw new Error('Malformed token data');
      }

      // Check if token is expired (valid for 30 days)
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
      if (Date.now() - timestamp > thirtyDaysInMs) {
        throw new Error('This review request link has expired');
      }

      setTokenData({
        customerId,
        customerEmail,
        timestamp,
      });

      requestLogger.info('Review request token decoded', {
        customerId,
        customerEmail,
      });
    } catch (err: any) {
      requestLogger.error('Failed to decode review request token', err);
      setError(err.message || 'Invalid review request link');
    }
  }, [searchParams]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <WelpLoadingIcon size={80} />
      </div>
    );
  }

  // Show error if token is invalid
  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  // If not logged in, redirect to login with return URL
  if (!currentUser && tokenData) {
    const returnUrl = `/review/request?token=${searchParams.get('token')}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(returnUrl)}`} replace />;
  }

  // If logged in as customer, show error
  if (currentUser && currentUser.type === 'customer') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only business accounts can respond to review requests. This link was sent to a business
              to invite them to review you as a customer.
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  // If logged in as business, redirect to new review page with pre-filled customer email
  if (currentUser && (currentUser.type === 'business' || currentUser.type === 'admin') && tokenData) {
    // Pass customer email as query param to pre-fill the form
    return <Navigate to={`/review/new?customerEmail=${encodeURIComponent(tokenData.customerEmail)}`} replace />;
  }

  // Fallback: Show loading
  return (
    <div className="flex items-center justify-center min-h-screen">
      <WelpLoadingIcon size={80} />
    </div>
  );
};

export default ReviewFromRequest;
