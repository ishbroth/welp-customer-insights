
import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGuestAccess } from "@/hooks/useGuestAccess";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const ReviewView = () => {
  const { reviewId } = useParams<{ reviewId: string }>();
  const [searchParams] = useSearchParams();
  const guestToken = searchParams.get("guest_token");
  
  const { hasAccess, isLoading: accessLoading } = useGuestAccess(reviewId!, guestToken || undefined);

  const { data: review, isLoading } = useQuery({
    queryKey: ['review', reviewId],
    queryFn: async () => {
      if (!reviewId) throw new Error("No review ID provided");
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles!reviews_business_id_fkey(name, avatar, verified)
        `)
        .eq('id', reviewId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!reviewId && hasAccess
  });

  if (accessLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Verifying your access...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p>You don't have access to view this review. Please purchase access first.</p>
              <Button className="w-full mt-4" onClick={() => window.location.href = `/one-time-review-access?reviewId=${reviewId}`}>
                Purchase Access
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Review Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>The review you're looking for could not be found.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="mb-6">
            <CardHeader className="bg-green-50 border-b border-green-200">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Guest Access Active - 24 Hours</span>
              </div>
              <CardTitle className="text-2xl">Review Details</CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              {/* Business Info */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Business</h3>
                <div className="flex items-center gap-3">
                  {review.profiles?.avatar && (
                    <img 
                      src={review.profiles.avatar} 
                      alt={review.profiles.name || "Business"} 
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium">{review.profiles?.name || "Business Name"}</p>
                    {review.profiles?.verified && (
                      <span className="text-sm text-blue-600">✓ Verified</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Customer</h3>
                <p className="font-medium">{review.customer_name}</p>
                {review.customer_phone && (
                  <p className="text-sm text-gray-600">📞 {review.customer_phone}</p>
                )}
                {review.customer_address && (
                  <p className="text-sm text-gray-600">📍 {review.customer_address}</p>
                )}
                {(review.customer_city || review.customer_zipcode) && (
                  <p className="text-sm text-gray-600">
                    {[review.customer_city, review.customer_zipcode].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Rating</h3>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{review.rating}/5</span>
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Review</h3>
                <p className="text-gray-700 leading-relaxed">{review.content}</p>
              </div>

              {/* Date */}
              <div className="text-sm text-gray-500 border-t pt-4">
                Review posted on {formatDate(review.created_at)}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReviewView;
