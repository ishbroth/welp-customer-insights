
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Bell, LogOut, Settings, User, FileText, Heart } from "lucide-react";
import SearchBox from "./SearchBox";
import { useMobile } from "@/hooks/use-mobile";
import MockDataToggle from "./MockDataToggle";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMobile } = useMobile();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getInitials = () => {
    if (currentUser) {
      if ('first_name' in currentUser && currentUser.first_name && 'last_name' in currentUser && currentUser.last_name) {
        return `${currentUser.first_name[0]}${currentUser.last_name[0]}`;
      } else if ('name' in currentUser && currentUser.name) {
        const nameParts = currentUser.name.split(' ');
        if (nameParts.length > 1) {
          return `${nameParts[0][0]}${nameParts[1][0]}`;
        }
        return nameParts[0][0];
      } else {
        return 'U';
      }
    }
    return 'W';
  };

  const isSearchPage = location.pathname === "/search";

  return (
    <header className="bg-welp-primary shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex">
              <span className="text-white text-xl font-bold">Welp!</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {!isSearchPage && (
              <div className="max-w-md w-full">
                <SearchBox />
              </div>
            )}
            
            <nav className="flex items-center space-x-4">
              <Link to="/about" className="text-white hover:text-gray-100">About</Link>
              <Link to="/how-it-works" className="text-white hover:text-gray-100">How it Works</Link>
              
              <MockDataToggle compact className="ml-2" />
              
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative p-0 rounded-full h-9 w-9 border-2 border-white hover:border-gray-200">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={
                          'avatar' in currentUser && typeof currentUser.avatar === 'string' 
                            ? currentUser.avatar 
                            : undefined
                        } />
                        <AvatarFallback className="bg-white text-welp-primary text-sm">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      My Account
                      {currentUser && 'type' in currentUser && (
                        <span className="block text-xs text-gray-500 mt-1 capitalize">
                          {currentUser.type} Account
                        </span>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    {currentUser && 'type' in currentUser && currentUser.type === 'business' && (
                      <DropdownMenuItem onClick={() => navigate('/profile/business-reviews')}>
                        <FileText className="mr-2 h-4 w-4" />
                        Business Reviews
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate('/profile/reviews')}>
                      <Heart className="mr-2 h-4 w-4" />
                      My Reviews
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile/notifications')}>
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile/edit')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" className="text-white hover:text-gray-200 hover:bg-welp-primary-dark" onClick={() => navigate('/login')}>
                    Log In
                  </Button>
                  <Button variant="outline" className="bg-transparent text-white hover:bg-white hover:text-welp-primary border-white" onClick={() => navigate('/signup')}>
                    Sign Up
                  </Button>
                </div>
              )}
            </nav>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center space-x-2">
            {!isSearchPage && (
              <button 
                onClick={() => navigate('/search')} 
                className="p-2 rounded-md text-white hover:bg-welp-primary-dark"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}
            <button 
              onClick={toggleMobileMenu} 
              className="p-2 rounded-md text-white hover:bg-welp-primary-dark"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/about"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
              onClick={toggleMobileMenu}
            >
              About
            </Link>
            <Link 
              to="/how-it-works"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
              onClick={toggleMobileMenu}
            >
              How it Works
            </Link>
            
            <div className="px-3 py-2">
              <MockDataToggle />
            </div>
            
            {currentUser ? (
              <>
                <Link 
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
                  onClick={toggleMobileMenu}
                >
                  <User className="inline-block mr-2 h-4 w-4" />
                  Profile
                </Link>
                {currentUser && 'type' in currentUser && currentUser.type === 'business' && (
                  <Link
                    to="/profile/business-reviews"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
                    onClick={toggleMobileMenu}
                  >
                    <FileText className="inline-block mr-2 h-4 w-4" />
                    Business Reviews
                  </Link>
                )}
                <Link 
                  to="/profile/reviews"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
                  onClick={toggleMobileMenu}
                >
                  <Heart className="inline-block mr-2 h-4 w-4" />
                  My Reviews
                </Link>
                <Link 
                  to="/profile/notifications"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
                  onClick={toggleMobileMenu}
                >
                  <Bell className="inline-block mr-2 h-4 w-4" />
                  Notifications
                </Link>
                <Link 
                  to="/profile/edit"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
                  onClick={toggleMobileMenu}
                >
                  <Settings className="inline-block mr-2 h-4 w-4" />
                  Settings
                </Link>
                <button 
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
                  onClick={() => {
                    handleLogout();
                    toggleMobileMenu();
                  }}
                >
                  <LogOut className="inline-block mr-2 h-4 w-4" />
                  Log out
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 px-3 py-2">
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => {
                    navigate('/login');
                    toggleMobileMenu();
                  }}
                >
                  Log In
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    navigate('/signup');
                    toggleMobileMenu();
                  }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
