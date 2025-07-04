
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TwilioAccountInfo from "@/components/debug/TwilioAccountInfo";
import TwilioSMSTest from "@/components/debug/TwilioSMSTest";

const TwilioDebug = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Twilio Debug & Testing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600 mb-6">
                Use this page to test your Twilio connection and verify SMS functionality
              </p>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <TwilioAccountInfo />
            <TwilioSMSTest />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TwilioDebug;
