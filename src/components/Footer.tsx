
import { Link, useNavigate } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  const handleLinkClick = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="bg-welp-dark text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-3 text-[#ea384c]">
              Welp.
            </h3>
            <p className="text-gray-300 text-sm">
              Review your customers. <br />
              Because businesses are people too.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-3">About</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><button onClick={() => handleLinkClick("/about")} className="hover:text-welp-primary transition-colors cursor-pointer">About Welp.</button></li>
              <li><button onClick={() => handleLinkClick("/how-it-works")} className="hover:text-welp-primary transition-colors cursor-pointer">How It Works</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><button onClick={() => handleLinkClick("/faq")} className="hover:text-welp-primary transition-colors cursor-pointer">FAQ</button></li>
              <li><button onClick={() => handleLinkClick("/terms")} className="hover:text-welp-primary transition-colors cursor-pointer">Terms of Service</button></li>
              <li><button onClick={() => handleLinkClick("/privacy")} className="hover:text-welp-primary transition-colors cursor-pointer">Privacy Policy</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-3">Business Owners</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><button onClick={() => handleLinkClick("/verification")} className="hover:text-welp-primary transition-colors cursor-pointer">Business Verification</button></li>
              <li><button onClick={() => handleLinkClick("/subscription")} className="hover:text-welp-primary transition-colors cursor-pointer">Subscription Benefits</button></li>
              <li><button onClick={() => handleLinkClick("/success-stories")} className="hover:text-welp-primary transition-colors cursor-pointer">Success Stories</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-3">Customer Accounts</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><button onClick={() => handleLinkClick("/customer-verification")} className="hover:text-welp-primary transition-colors cursor-pointer">Customer Verification</button></li>
              <li><button onClick={() => handleLinkClick("/customer-benefits")} className="hover:text-welp-primary transition-colors cursor-pointer">Subscription Benefits</button></li>
              <li><button onClick={() => handleLinkClick("/customer-stories")} className="hover:text-welp-primary transition-colors cursor-pointer">Success Stories</button></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-700">
          <p className="text-gray-400 text-sm text-center md:text-left">
            © {currentYear} Welp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
