import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import ProfileMobileMenu from "@/components/ProfileMobileMenu";
import MobileScaleWrapper from "@/components/MobileScaleWrapper";
import AvatarBackground from "@/components/AvatarBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, Send, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { reviewRequestsService, type ReviewRequest } from "@/services/reviewRequestsService";
import { format } from "date-fns";
import { logger } from "@/utils/logger";

const requestLogger = logger.withContext('RequestReviewsPage');

const RequestReviews = () => {
  const { currentUser, loading } = useAuth();
  const { toast } = useToast();

  const [businessEmail, setBusinessEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const pageSize = 10;

  // Fetch request history
  const fetchRequestHistory = async (page: number = 1) => {
    if (!currentUser) return;

    setIsLoadingHistory(true);
    try {
      const result = await reviewRequestsService.getRequestHistory({
        customerId: currentUser.id,
        page,
        pageSize,
      });

      setRequests(result.requests);
      setTotalPages(result.totalPages);
      setTotal(result.total);
      setCurrentPage(page);
    } catch (error: any) {
      requestLogger.error('Failed to fetch request history', error);
      toast({
        title: "Error",
        description: "Failed to load request history",
        variant: "destructive",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Load history on mount
  useEffect(() => {
    if (currentUser) {
      fetchRequestHistory(1);
    }
  }, [currentUser]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !businessEmail.trim()) {
      return;
    }

    const email = businessEmail.trim().toLowerCase();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Check if user can request (30-day cooldown)
    try {
      const eligibility = await reviewRequestsService.canRequestReview(
        currentUser.id,
        email
      );

      if (!eligibility.canRequest) {
        toast({
          title: "Request Already Sent",
          description: eligibility.message,
          variant: "destructive",
        });
        return;
      }
    } catch (error: any) {
      requestLogger.error('Failed to check eligibility', error);
      toast({
        title: "Error",
        description: "Failed to check request eligibility",
        variant: "destructive",
      });
      return;
    }

    // Send review request
    setIsSubmitting(true);
    try {
      // Handle first/last name - split from full name if needed
      let firstName = currentUser.first_name;
      let lastName = currentUser.last_name;

      if (!firstName || !lastName) {
        // If first/last name not available, try splitting full name
        const nameParts = (currentUser.name || '').trim().split(' ');
        if (nameParts.length >= 2) {
          firstName = firstName || nameParts[0];
          lastName = lastName || nameParts.slice(1).join(' ');
        } else if (nameParts.length === 1) {
          firstName = firstName || nameParts[0];
          lastName = lastName || nameParts[0];
        }
      }

      // Final fallback: use "Customer" if still no name
      const finalFirstName = firstName || 'Customer';
      const finalLastName = lastName || 'Customer';

      const result = await reviewRequestsService.sendReviewRequest({
        businessEmail: email,
        customerEmail: currentUser.email || '',
        customerFirstName: finalFirstName,
        customerLastName: finalLastName,
        customerId: currentUser.id,
      });

      if (result.success) {
        toast({
          title: result.isExistingBusiness ? "Request Sent!" : "Invitation Sent!",
          description: result.isExistingBusiness
            ? "Your review request has been sent to the business."
            : "We've sent an invitation to join Welp to this email address.",
        });
        setBusinessEmail("");
        // Refresh history
        fetchRequestHistory(1);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send review request",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      requestLogger.error('Failed to send request', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Only customers can access this page
  if (currentUser.type !== "customer") {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="flex flex-col overflow-x-hidden max-w-[100vw]">
      <AvatarBackground avatarUrl={currentUser?.avatar} />
      <Header />
      <ProfileMobileMenu />
      <div className="flex relative z-10 overflow-x-hidden max-w-full">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <ProfileSidebar isOpen={true} toggle={() => {}} />
        </div>
        <main className="flex-1 px-3 py-6 md:px-4 overflow-x-hidden max-w-full">
          <MobileScaleWrapper>
            <div className="w-full overflow-x-hidden max-w-4xl mx-auto">
              {/* Page Header */}
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                  <Mail className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                  Request Reviews
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  Request reviews through Welp from your favorite businesses. Just enter their email,
                  and if they have an account, we'll invite them to review you as a customer.
                </p>
              </div>

              {/* Request Form */}
              <Card className="p-4 md:p-6 mb-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="businessEmail" className="block text-sm font-medium mb-2">
                      Business Email Address
                    </label>
                    <Input
                      id="businessEmail"
                      type="email"
                      placeholder="Enter business email"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      disabled={isSubmitting}
                      required
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      If the business isn't on Welp yet, we'll send them an invitation to join.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !businessEmail.trim()}
                    className="w-full md:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Review Request
                      </>
                    )}
                  </Button>
                </form>
              </Card>

              {/* Request History */}
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-4">Request History</h2>
                {isLoadingHistory ? (
                  <div className="text-center py-8 text-gray-500">Loading history...</div>
                ) : requests.length === 0 ? (
                  <Card className="p-6 text-center text-gray-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>You haven't sent any review requests yet.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {requests.map((request) => (
                      <Card key={request.id} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <p className="font-medium text-sm md:text-base truncate">
                                {request.business_name || request.business_email}
                              </p>
                            </div>
                            {request.business_name && (
                              <p className="text-xs md:text-sm text-gray-500 truncate">
                                {request.business_email}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Sent {format(new Date(request.sent_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchRequestHistory(currentPage - 1)}
                          disabled={currentPage === 1 || isLoadingHistory}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchRequestHistory(currentPage + 1)}
                          disabled={currentPage === totalPages || isLoadingHistory}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-center text-gray-500 mt-2">
                      Showing {requests.length} of {total} request{total !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </MobileScaleWrapper>
        </main>
      </div>
      <Footer className="mt-0" />
    </div>
  );
};

export default RequestReviews;
