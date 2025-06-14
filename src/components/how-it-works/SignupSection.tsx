
import { ArrowRight, CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SignupSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-12">
            Join thousands of businesses using our platform to build better customer relationships.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <ArrowRight className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Start Writing Reviews</h3>
              <p className="text-gray-600 mb-4">
                Create your business account and start writing reviews immediately. All accounts can write permanent reviews.
              </p>
              <Button 
                onClick={() => navigate("/signup")}
                className="w-full"
              >
                Create Business Account
              </Button>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Verified</h3>
              <p className="text-gray-600 mb-4">
                Enhance your credibility with verification. Verified accounts get priority in search results and display a trust badge.
              </p>
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium">Verified Business</span>
              </div>
              <Button 
                variant="outline"
                onClick={() => navigate("/verify-license")}
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Learn About Verification
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <button 
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignupSection;
