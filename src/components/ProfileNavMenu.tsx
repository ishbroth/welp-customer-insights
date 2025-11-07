import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Settings,
  User,
  FileText,
  Bell,
  LogOut,
  Search,
  Edit,
} from "lucide-react";

interface ProfileNavMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileNavMenu = ({ isOpen, onClose }: ProfileNavMenuProps) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  
  const isBusinessAccount = currentUser?.type === "business" || currentUser?.type === "admin";
  const isCustomerAccount = currentUser?.type === "customer";
  
  // Function to truncate email if too long
  const truncateEmail = (email: string) => {
    if (email.length > 18) {
      return email.substring(0, 18) + "...";
    }
    return email;
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleLinkClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="fixed top-16 right-0 w-72 h-[calc(100vh-4rem)] bg-white shadow-lg z-50 flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-14 w-14">
              {currentUser?.avatar ? (
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              ) : (
                <AvatarFallback className="text-lg">{currentUser?.name?.[0] || "U"}</AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-lg">{currentUser?.name}</h3>
              <p className="text-gray-500 truncate text-base">
                {currentUser?.email ? truncateEmail(currentUser.email) : ""}
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 py-4">
          <nav className="space-y-1 px-4">
            {/* Business users - show search for customers */}
            {isBusinessAccount && (
              <Link
                to="/search"
                onClick={handleLinkClick}
                className={`flex items-center px-4 py-4 text-base rounded-md hover:bg-gray-100 transition-colors ${
                  location.pathname === "/search"
                  ? "bg-gray-100 text-primary"
                  : "text-gray-700"
                }`}
              >
                <Search className="mr-4 h-6 w-6 text-gray-500" />
                Search
              </Link>
            )}

            {/* Customer users - show reviews written about them by businesses - TOP OF CUSTOMER MENU */}
            {isCustomerAccount && (
              <Link
                to="/profile/reviews"
                onClick={handleLinkClick}
                className={`flex items-center px-4 py-4 text-base rounded-md hover:bg-gray-100 transition-colors ${
                  location.pathname === "/profile/reviews"
                  ? "bg-gray-100 text-primary"
                  : "text-gray-700"
                }`}
              >
                <FileText className="mr-4 h-6 w-6 text-gray-500" />
                Reviews About Me
              </Link>
            )}

            {/* Post Review - business users only */}
            {isBusinessAccount && (
              <Link
                to="/review/new"
                onClick={handleLinkClick}
                className={`flex items-center px-4 py-4 text-base rounded-md hover:bg-gray-100 transition-colors ${
                  location.pathname === "/review/new"
                  ? "bg-gray-100 text-primary"
                  : "text-gray-700"
                }`}
              >
                <Edit className="mr-4 h-6 w-6 text-gray-500" />
                Post Review
              </Link>
            )}

            {/* Business users - show reviews they've written about customers */}
            {isBusinessAccount && (
              <Link
                to="/profile/business-reviews"
                onClick={handleLinkClick}
                className={`flex items-center px-4 py-4 text-base rounded-md hover:bg-gray-100 transition-colors ${
                  location.pathname === "/profile/business-reviews"
                  ? "bg-gray-100 text-primary"
                  : "text-gray-700"
                }`}
              >
                <FileText className="mr-4 h-6 w-6 text-gray-500" />
                My Customer Reviews
              </Link>
            )}

            <Link
              to="/profile"
              onClick={handleLinkClick}
              className={`flex items-center px-4 py-4 text-base rounded-md hover:bg-gray-100 transition-colors ${
                location.pathname === "/profile"
                ? "bg-gray-100 text-primary"
                : "text-gray-700"
              }`}
            >
              <User className="mr-4 h-6 w-6 text-gray-500" />
              Profile
            </Link>

            <Link
              to="/profile/edit"
              onClick={handleLinkClick}
              className={`flex items-center px-4 py-4 text-base rounded-md hover:bg-gray-100 transition-colors ${
                location.pathname === "/profile/edit"
                ? "bg-gray-100 text-primary"
                : "text-gray-700"
              }`}
            >
              <Settings className="mr-4 h-6 w-6 text-gray-500" />
              Edit Profile
            </Link>

            <Link 
              to="/profile/billing" 
              onClick={handleLinkClick}
              className={`flex items-center px-4 py-4 text-base rounded-md hover:bg-gray-100 transition-colors ${
                location.pathname === "/profile/billing" 
                ? "bg-gray-100 text-primary" 
                : "text-gray-700"
              }`}
            >
              <CreditCard className="mr-4 h-6 w-6 text-gray-500" />
              Billing
            </Link>
            
            <Link
              to="/notifications"
              onClick={handleLinkClick}
              className={`flex items-center px-4 py-4 text-base rounded-md hover:bg-gray-100 transition-colors ${
                location.pathname === "/notifications"
                ? "bg-gray-100 text-primary"
                : "text-gray-700"
              }`}
            >
              <Bell className="mr-4 h-6 w-6 text-gray-500" />
              Notifications
            </Link>

            {/* Logout button moved up with other menu items */}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-4 text-base rounded-md hover:bg-gray-100 transition-colors text-gray-700"
            >
              <LogOut className="mr-4 h-6 w-6 text-gray-500" />
              Log Out
            </button>
          </nav>
        </div>
      </div>
    </>
  );
};

export default ProfileNavMenu;