import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X, User, Search } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white shadow-md py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-3xl font-bold text-[#ea384c] bg-transparent">
                Welp!
              </span>
            </Link>
            <span className="hidden md:block ml-2 text-sm text-welp-gray italic">
              Because businesses are people too
            </span>
          </div>

          {isMobile ? (
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMenu} 
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6 text-welp-dark" />
                ) : (
                  <Menu className="h-6 w-6 text-welp-dark" />
                )}
              </Button>
            </div>
          ) : (
            <nav className="flex items-center space-x-4">
              <Link 
                to="/search" 
                className="text-welp-dark hover:text-[#ea384c] transition-colors flex items-center"
              >
                <Search className="mr-1 h-4 w-4" /> Search
              </Link>
              <Link
                to="/login"
                className="text-welp-dark hover:text-[#ea384c] transition-colors flex items-center"
              >
                <User className="mr-1 h-4 w-4" /> Login
              </Link>
              <Link to="/signup">
                <Button className="bg-[#ea384c] hover:bg-[#d02e40] text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 w-full">Sign Up</Button>
              </Link>
            </nav>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobile && isMenuOpen && (
          <div className="mt-4 py-2 border-t border-gray-200">
            <nav className="flex flex-col space-y-3">
              <Link
                to="/search"
                className="text-welp-dark hover:text-[#ea384c] transition-colors flex items-center py-2"
                onClick={toggleMenu}
              >
                <Search className="mr-2 h-4 w-4" /> Search
              </Link>
              <Link
                to="/login"
                className="text-welp-dark hover:text-[#ea384c] transition-colors flex items-center py-2"
                onClick={toggleMenu}
              >
                <User className="mr-2 h-4 w-4" /> Login
              </Link>
              <Link to="/signup" onClick={toggleMenu}>
                <Button className="bg-[#ea384c] hover:bg-[#d02e40] text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 w-full">Sign Up</Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
