
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { logger } from '@/utils/logger';

const ReportReview = () => {
  const pageLogger = logger.withContext('ReportReview');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const reviewId = searchParams.get("reviewId");
  const [isAboutReporter, setIsAboutReporter] = useState(false);
  const [complaint, setComplaint] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !reviewId) {
      toast({
        title: "Error",
        description: "Missing required information to submit report.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert the report into the database
      const { error } = await supabase
        .from('review_reports')
        .insert({
          review_id: reviewId,
          reporter_id: currentUser.id,
          reporter_name: currentUser.name || 'Anonymous',
          reporter_email: currentUser.email,
          reporter_phone: currentUser.phone,
          is_about_reporter: isAboutReporter,
          complaint: isAboutReporter ? complaint : null,
        });

      if (error) {
        throw error;
      }

      // Send email notification using edge function
      await supabase.functions.invoke('send-notification', {
        body: {
          type: 'review_report',
          recipientEmail: 'isaac.wiley99@gmail.com',
          data: {
            reporterName: currentUser.name || 'Anonymous',
            reporterEmail: currentUser.email,
            reporterPhone: currentUser.phone,
            reviewId,
            isAboutReporter,
            complaint: isAboutReporter ? complaint : null,
          }
        }
      });

      toast({
        title: "Report Submitted",
        description: "Your report has been submitted successfully. We will review it and take appropriate action.",
      });

      navigate("/profile/reviews");
    } catch (error) {
      pageLogger.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p>Please log in to report a review.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Report This Review</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-semibold mb-2">Reporter Information</h3>
                    <p><strong>Name:</strong> {currentUser.name || 'Anonymous'}</p>
                    <p><strong>Email:</strong> {currentUser.email}</p>
                    {currentUser.phone && <p><strong>Phone:</strong> {currentUser.phone}</p>}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isAboutReporter"
                      checked={isAboutReporter}
                      onCheckedChange={(checked) => setIsAboutReporter(checked as boolean)}
                    />
                    <Label htmlFor="isAboutReporter" className="font-medium">
                      Is this review about you?
                    </Label>
                  </div>

                  {isAboutReporter && (
                    <div className="space-y-2">
                      <Label htmlFor="complaint">
                        Please describe your complaint (max 500 characters):
                      </Label>
                      <Textarea
                        id="complaint"
                        value={complaint}
                        onChange={(e) => setComplaint(e.target.value.slice(0, 500))}
                        placeholder="Describe why you believe this review should be investigated..."
                        className="min-h-[100px]"
                        maxLength={500}
                      />
                      <p className="text-sm text-gray-500">
                        {complaint.length}/500 characters
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Report"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/profile/reviews")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReportReview;
