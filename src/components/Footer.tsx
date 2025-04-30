
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-welp-dark text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
              <li><Link to="/about" className="hover:text-welp-primary transition-colors">About Welp.</Link></li>
              <li><Link to="/how-it-works" className="hover:text-welp-primary transition-colors">How It Works</Link></li>
              <li><Link to="/pricing" className="hover:text-welp-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link to="/contact" className="hover:text-welp-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-welp-primary transition-colors">FAQ</Link></li>
              <li><Link to="/terms" className="hover:text-welp-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-welp-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-3">Business Owners</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link to="/verification" className="hover:text-welp-primary transition-colors">Business Verification</Link></li>
              <li><Link to="/subscription" className="hover:text-welp-primary transition-colors">Subscription Benefits</Link></li>
              <li><Link to="/success-stories" className="hover:text-welp-primary transition-colors">Success Stories</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Welp. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <Link to="/admin" className="text-gray-400 text-xs hover:text-[#ea384c] transition-colors">
              Admin Sign-in
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
