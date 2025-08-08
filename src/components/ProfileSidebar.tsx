
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  CreditCard, 
  Settings, 
  User, 
  FileText, 
  Bell,
  Menu,
  X
} from "lucide-react";

interface ProfileSidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const ProfileSidebar = ({ isOpen, toggle }: ProfileSidebarProps) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const isBusinessAccount = currentUser?.type === "business" || currentUser?.type === "admin";
  const isCustomerAccount = currentUser?.type === "customer";
  
  // Function to truncate email if too long
  const truncateEmail = (email: string) => {
    if (email.length > 18) {
      return email.substring(0, 18) + "...";
    }
    return email;
  };
  
  return (
    <>
      {/* Sidebar - always visible on mobile as narrow when closed */}
      <div 
        className={`${isMobile ? 'fixed' : 'relative'} left-0 z-40 bg-white shadow-lg transition-all duration-300 ease-in-out ${
          isMobile 
            ? `top-16 ${isOpen ? "w-72" : "w-12"} h-[calc(100vh-4rem-theme(spacing.20))]` 
            : "h-full w-64"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header - hidden in narrow mobile mode */}
          {(!isMobile || isOpen) && (
            <div className={`border-b ${isMobile ? "p-4" : "p-6"}`}>
              {isMobile && (
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Profile Menu</h2>
                  <Button variant="ghost" size="sm" onClick={toggle}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              )}
              <div className="flex items-center space-x-4">
                <Avatar className={`${isMobile ? "h-14 w-14" : "h-12 w-12"}`}>
                  {currentUser?.avatar ? (
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  ) : (
                    <AvatarFallback className="text-lg">{currentUser?.name?.[0] || "U"}</AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className={`font-medium ${isMobile ? "text-lg" : "text-base"}`}>{currentUser?.name}</h3>
                  <p className={`text-gray-500 truncate ${isMobile ? "text-base" : "text-sm"}`}>
                    {currentUser?.email ? truncateEmail(currentUser.email) : ""}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Mobile narrow mode - show user avatar and expand button */}
          {isMobile && !isOpen && (
            <div className="p-2 border-b">
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-8 w-8 cursor-pointer" onClick={toggle}>
                  {currentUser?.avatar ? (
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  ) : (
                    <AvatarFallback className="text-xs">{currentUser?.name?.[0] || "U"}</AvatarFallback>
                  )}
                </Avatar>
                <Button variant="ghost" size="sm" onClick={toggle} className="p-1 h-6 w-6">
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex-1 py-4">
            <nav className={`space-y-1 ${isMobile && !isOpen ? "px-1" : "px-4"}`}>
              <Link 
                to="/profile" 
                onClick={isMobile && isOpen ? toggle : undefined}
                className={`flex items-center rounded-md hover:bg-gray-100 transition-colors ${
                  isMobile && !isOpen 
                    ? "px-1 py-2 justify-center" 
                    : isMobile 
                      ? "px-4 py-4 text-base" 
                      : "px-2 py-2 text-sm"
                } ${
                  location.pathname === "/profile" 
                  ? "bg-gray-100 text-primary" 
                  : "text-gray-700"
                }`}
              >
                <User className={`text-gray-500 ${
                  isMobile && !isOpen 
                    ? "h-5 w-5" 
                    : isMobile 
                      ? "mr-4 h-6 w-6" 
                      : "mr-3 h-5 w-5"
                }`} />
                {(!isMobile || isOpen) && "Profile"}
              </Link>
              
              <Link 
                to="/profile/edit" 
                onClick={isMobile && isOpen ? toggle : undefined}
                className={`flex items-center rounded-md hover:bg-gray-100 transition-colors ${
                  isMobile && !isOpen 
                    ? "px-1 py-2 justify-center" 
                    : isMobile 
                      ? "px-4 py-4 text-base" 
                      : "px-2 py-2 text-sm"
                } ${
                  location.pathname === "/profile/edit" 
                  ? "bg-gray-100 text-primary" 
                  : "text-gray-700"
                }`}
              >
                <Settings className={`text-gray-500 ${
                  isMobile && !isOpen 
                    ? "h-5 w-5" 
                    : isMobile 
                      ? "mr-4 h-6 w-6" 
                      : "mr-3 h-5 w-5"
                }`} />
                {(!isMobile || isOpen) && "Edit Profile"}
              </Link>
              
              {/* Business users - show reviews they've written about customers */}
              {isBusinessAccount && (
                <Link 
                  to="/profile/business-reviews" 
                  onClick={isMobile && isOpen ? toggle : undefined}
                  className={`flex items-center rounded-md hover:bg-gray-100 transition-colors ${
                    isMobile && !isOpen 
                      ? "px-1 py-2 justify-center" 
                      : isMobile 
                        ? "px-4 py-4 text-base" 
                        : "px-2 py-2 text-sm"
                  } ${
                    location.pathname === "/profile/business-reviews" 
                    ? "bg-gray-100 text-primary" 
                    : "text-gray-700"
                  }`}
                >
                  <FileText className={`text-gray-500 ${
                    isMobile && !isOpen 
                      ? "h-5 w-5" 
                      : isMobile 
                        ? "mr-4 h-6 w-6" 
                        : "mr-3 h-5 w-5"
                  }`} />
                  {(!isMobile || isOpen) && "My Customer Reviews"}
                </Link>
              )}
              
              {/* Customer users - show reviews written about them by businesses */}
              {isCustomerAccount && (
                <Link 
                  to="/profile/reviews" 
                  onClick={isMobile && isOpen ? toggle : undefined}
                  className={`flex items-center rounded-md hover:bg-gray-100 transition-colors ${
                    isMobile && !isOpen 
                      ? "px-1 py-2 justify-center" 
                      : isMobile 
                        ? "px-4 py-4 text-base" 
                        : "px-2 py-2 text-sm"
                  } ${
                    location.pathname === "/profile/reviews" 
                    ? "bg-gray-100 text-primary" 
                    : "text-gray-700"
                  }`}
                >
                  <FileText className={`text-gray-500 ${
                    isMobile && !isOpen 
                      ? "h-5 w-5" 
                      : isMobile 
                        ? "mr-4 h-6 w-6" 
                        : "mr-3 h-5 w-5"
                  }`} />
                  {(!isMobile || isOpen) && "Reviews About Me"}
                </Link>
              )}
              
              <Link 
                to="/profile/billing" 
                onClick={isMobile && isOpen ? toggle : undefined}
                className={`flex items-center rounded-md hover:bg-gray-100 transition-colors ${
                  isMobile && !isOpen 
                    ? "px-1 py-2 justify-center" 
                    : isMobile 
                      ? "px-4 py-4 text-base" 
                      : "px-2 py-2 text-sm"
                } ${
                  location.pathname === "/profile/billing" 
                  ? "bg-gray-100 text-primary" 
                  : "text-gray-700"
                }`}
              >
                <CreditCard className={`text-gray-500 ${
                  isMobile && !isOpen 
                    ? "h-5 w-5" 
                    : isMobile 
                      ? "mr-4 h-6 w-6" 
                      : "mr-3 h-5 w-5"
                }`} />
                {(!isMobile || isOpen) && "Billing"}
              </Link>
              
              <Link 
                to="/notifications" 
                onClick={isMobile && isOpen ? toggle : undefined}
                className={`flex items-center rounded-md hover:bg-gray-100 transition-colors ${
                  isMobile && !isOpen 
                    ? "px-1 py-2 justify-center" 
                    : isMobile 
                      ? "px-4 py-4 text-base" 
                      : "px-2 py-2 text-sm"
                } ${
                  location.pathname === "/notifications" 
                  ? "bg-gray-100 text-primary" 
                  : "text-gray-700"
                }`}
              >
                <Bell className={`text-gray-500 ${
                  isMobile && !isOpen 
                    ? "h-5 w-5" 
                    : isMobile 
                      ? "mr-4 h-6 w-6" 
                      : "mr-3 h-5 w-5"
                }`} />
                {(!isMobile || isOpen) && "Notifications"}
              </Link>
            </nav>
          </div>
          
          {/* Footer - only show in desktop or mobile expanded mode */}
          {(!isMobile || isOpen) && (
            <div className={`border-t ${isMobile ? "p-4" : "p-4"}`}>
              <Button 
                variant="outline" 
                className={`w-full transition-colors ${isMobile ? "h-12 text-base" : "h-10 text-sm"}`}
                onClick={() => {
                  logout();
                  if (isMobile) toggle();
                }}
              >
                Log Out
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile backdrop - only show when expanded */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 backdrop-blur-sm"
          onClick={toggle}
        />
      )}
    </>
  );
};

export default ProfileSidebar;
