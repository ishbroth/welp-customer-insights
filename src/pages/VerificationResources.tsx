
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

const VerificationResources = () => {
  const navigate = useNavigate();
  
  const handleBackToVerification = () => {
    navigate('/verification');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-8">
            <div className="flex items-center justify-center mb-6">
              <Shield className="h-12 w-12 text-welp-primary mr-3" />
              <h1 className="text-3xl font-bold">Verification Resources</h1>
            </div>
            
            <p className="text-center text-gray-600 mb-8">
              Welp connects to various official databases and registries to verify business licenses and credentials in real-time.
            </p>

            {/* Real-Time License Verification */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold">Real-Time License Verification</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card className="p-4 border-green-200 bg-green-50">
                  <h3 className="font-semibold mb-2 text-green-800">California</h3>
                  <ul className="text-sm space-y-1 text-green-700">
                    <li>• Contractor License Board (CSLB)</li>
                    <li>• Real Estate License (DRE)</li>
                    <li>• Liquor License (ABC)</li>
                    <li>• State Bar Association</li>
                    <li>• Medical Board</li>
                    <li>• Secretary of State Business Registry</li>
                  </ul>
                </Card>
                
                <Card className="p-4 border-blue-200 bg-blue-50">
                  <h3 className="font-semibold mb-2 text-blue-800">Florida</h3>
                  <ul className="text-sm space-y-1 text-blue-700">
                    <li>• Department of Business & Professional Regulation (DBPR)</li>
                    <li>• Contractor Licenses</li>
                    <li>• Real Estate Licenses</li>
                    <li>• Professional Licenses</li>
                  </ul>
                </Card>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-4 border-purple-200 bg-purple-50">
                  <h3 className="font-semibold mb-2 text-purple-800">Texas</h3>
                  <ul className="text-sm space-y-1 text-purple-700">
                    <li>• Real Estate Commission (TREC)</li>
                    <li>• Alcoholic Beverage Commission (TABC)</li>
                    <li>• Secretary of State Business Registry</li>
                    <li>• Local Jurisdiction Licenses</li>
                  </ul>
                </Card>
                
                <Card className="p-4 border-orange-200 bg-orange-50">
                  <h3 className="font-semibold mb-2 text-orange-800">New York</h3>
                  <ul className="text-sm space-y-1 text-orange-700">
                    <li>• State Liquor Authority (SLA)</li>
                    <li>• Professional Licensing Boards</li>
                    <li>• Secretary of State Business Registry</li>
                  </ul>
                </Card>
              </div>
            </div>

            {/* EIN Verification */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold">EIN Verification</h2>
              </div>
              
              <Card className="p-4 border-blue-200 bg-blue-50">
                <p className="text-blue-800 mb-2">
                  <strong>Employer Identification Number (EIN) Format Validation</strong>
                </p>
                <p className="text-sm text-blue-700">
                  We verify EIN format compliance (9-digit federal tax identification numbers) and cross-reference 
                  with publicly available business registration databases where possible.
                </p>
              </Card>
            </div>

            {/* Expanding Coverage */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-amber-600 mr-2" />
                <h2 className="text-xl font-semibold">Expanding Coverage</h2>
              </div>
              
              <Card className="p-4 border-amber-200 bg-amber-50">
                <p className="text-amber-800 mb-3">
                  <strong>Additional States & License Types</strong>
                </p>
                <p className="text-sm text-amber-700 mb-3">
                  We're continuously expanding our verification capabilities to include more states and license types. 
                  For states not yet supported with real-time verification, we offer alternative verification methods 
                  including phone verification and manual review processes.
                </p>
                <p className="text-sm text-amber-700">
                  <strong>Coming Soon:</strong> Illinois, Pennsylvania, Ohio, Georgia, North Carolina, and additional 
                  professional licensing boards nationwide.
                </p>
              </Card>
            </div>

            {/* Verification Process */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">How Verification Works</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-welp-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">1</div>
                  <div>
                    <h4 className="font-medium">Real-Time Database Check</h4>
                    <p className="text-sm text-gray-600">Your license information is instantly verified against official state databases.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-welp-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">2</div>
                  <div>
                    <h4 className="font-medium">Immediate Verification</h4>
                    <p className="text-sm text-gray-600">If found and active, you're immediately verified and can access all platform features.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-welp-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">3</div>
                  <div>
                    <h4 className="font-medium">Fallback Options</h4>
                    <p className="text-sm text-gray-600">If real-time verification isn't available, we offer phone verification or manual review processes.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Security */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Data Security & Privacy</h2>
              
              <Card className="p-4 border-gray-200 bg-gray-50">
                <p className="text-gray-800 mb-2">
                  <strong>Your Information is Protected</strong>
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• All verification requests are encrypted and secure</li>
                  <li>• We only access publicly available license information</li>
                  <li>• Your personal data is never shared with third parties</li>
                  <li>• Verification data is used solely for platform authentication</li>
                </ul>
              </Card>
            </div>

            <div className="text-center">
              <Button onClick={handleBackToVerification} className="welp-button mr-4">
                ← Back to Verification
              </Button>
              
              <Button 
                onClick={() => navigate('/signup?type=business')} 
                className="welp-button"
              >
                Start Verification Process
              </Button>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerificationResources;
