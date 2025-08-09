import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/auth";
import { Menu, X, User, Search, Edit, LogOut, LogIn } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ProfileNavMenu from "./ProfileNavMenu";

const ProfileHeader = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  // Determine if current user is a business owner (not a customer)
  const isBusinessOwner = currentUser?.type === "business" || currentUser?.type === "admin";
  
  // Show search for non-logged in users or business owners
  const showSearch = !currentUser || isBusinessOwner;

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
  };
  
  // Truncate username for mobile display
  const truncateUsername = (name: string) => {
    if (name.length > 15) {
      return name.substring(0, 15) + "...";
    }
    return name;
  };

  return (
    <>
      <header className="bg-white shadow-md py-3 md:py-4 sticky top-0 z-50">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-2xl md:text-3xl font-bold text-[#ea384c] bg-transparent">
                  Welp.
                </span>
              </Link>
              <span className="hidden md:block ml-2 text-sm text-welp-gray italic">
                Because businesses are people too
              </span>
            </div>

            {isMobile ? (
              <div className="flex items-center">
                {/* Mobile header layout for profile pages */}
                <div className="flex items-center space-x-2 text-xs">
                  {/* Search link for business users */}
                  {showSearch && (
                    <Link 
                      to="/search" 
                      className="text-welp-dark hover:text-[#ea384c] transition-colors flex items-center"
                    >
                      <Search className="h-3 w-3 mr-1" />
                      <span className="text-xs">search</span>
                    </Link>
                  )}
                  
                  {/* Post Review for business owners */}
                  {isBusinessOwner && (
                    <Link 
                      to="/review/new" 
                      className="text-welp-dark hover:text-[#ea384c] transition-colors flex items-center"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      <span className="text-xs">post review</span>
                    </Link>
                  )}
                  
                  {/* Hamburger Menu for Profile Navigation */}
                  {currentUser && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="p-1 h-6 w-6"
                    >
                      {isProfileMenuOpen ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Menu className="h-4 w-4" />
                      )}
                    </Button>
                  )}

                  {/* Sign in link for non-authenticated users */}
                  {!currentUser && (
                    <Link 
                      to="/login" 
                      className="text-welp-dark hover:text-[#ea384c] transition-colors flex items-center"
                    >
                      <LogIn className="h-3 w-3 mr-1" />
                      <span className="text-xs">sign in</span>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <nav className="flex items-center space-x-4">
                {/* Show search link for non-logged in users or business owners */}
                {showSearch && (
                  <Link 
                    to="/search" 
                    className="text-welp-dark hover:text-[#ea384c] transition-colors flex items-center"
                  >
                    <Search className="mr-1 h-4 w-4" /> Search
                  </Link>
                )}
                
                {/* Only show Post Review for business owners */}
                {isBusinessOwner && (
                  <Link 
                    to="/review/new" 
                    className="text-welp-dark hover:text-[#ea384c] transition-colors flex items-center"
                  >
                    <Edit className="mr-1 h-4 w-4" /> Post Review
                  </Link>
                )}
                
                {currentUser ? (
                  <div className="flex items-center space-x-4">
                    <Link to="/profile" className="flex items-center space-x-2 text-welp-dark hover:text-[#ea384c] transition-colors">
                      <Avatar className="h-8 w-8">
                        {currentUser.avatar ? (
                          <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                        ) : (
                          <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                        )}
                      </Avatar>
                      <span className="hidden md:inline">{currentUser.name}</span>
                    </Link>
                    <Button 
                      variant="ghost"
                      className="flex items-center text-welp-dark hover:text-[#ea384c]"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-1 h-4 w-4" /> Logout
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-welp-dark hover:text-[#ea384c] transition-colors flex items-center"
                    >
                      <LogIn className="mr-1 h-4 w-4" /> Login
                    </Link>
                    <Link to="/signup">
                      <Button className="bg-[#ea384c] hover:bg-[#d02e40] text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 w-full">Sign Up</Button>
                    </Link>
                  </>
                )}
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* Profile Navigation Menu - Mobile Only */}
      {isMobile && currentUser && (
        <ProfileNavMenu 
          isOpen={isProfileMenuOpen}
          onClose={() => setIsProfileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default ProfileHeader;