
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Settings, 
  User, 
  FileText, 
  Bell,
  Menu
} from "lucide-react";

interface ProfileSidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const ProfileSidebar = ({ isOpen, toggle }: ProfileSidebarProps) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  
  return (
    <>
      <div className="md:hidden flex items-center p-4">
        <Button variant="ghost" onClick={toggle}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      
      <div 
        className={`fixed md:relative inset-y-0 left-0 z-40 bg-white w-64 shadow-lg transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                {currentUser?.avatar ? (
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                ) : (
                  <AvatarFallback>{currentUser?.name?.[0] || "U"}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="font-medium">{currentUser?.name}</h3>
                <p className="text-sm text-gray-500">{currentUser?.email}</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 py-4">
            <nav className="px-4 space-y-1">
              <Link 
                to="/profile" 
                className={`flex items-center px-2 py-2 text-sm rounded-md hover:bg-gray-100 ${
                  location.pathname === "/profile" 
                  ? "bg-gray-100 text-primary" 
                  : "text-gray-700"
                }`}
              >
                <User className="mr-3 h-5 w-5 text-gray-500" />
                Profile
              </Link>
              <Link 
                to="/profile/edit" 
                className={`flex items-center px-2 py-2 text-sm rounded-md hover:bg-gray-100 ${
                  location.pathname === "/profile/edit" 
                  ? "bg-gray-100 text-primary" 
                  : "text-gray-700"
                }`}
              >
                <Settings className="mr-3 h-5 w-5 text-gray-500" />
                Edit Profile
              </Link>
              <Link 
                to="/profile/reviews" 
                className={`flex items-center px-2 py-2 text-sm rounded-md hover:bg-gray-100 ${
                  location.pathname === "/profile/reviews" 
                  ? "bg-gray-100 text-primary" 
                  : "text-gray-700"
                }`}
              >
                <FileText className="mr-3 h-5 w-5 text-gray-500" />
                My Reviews
              </Link>
              <Link 
                to="/profile/billing" 
                className={`flex items-center px-2 py-2 text-sm rounded-md hover:bg-gray-100 ${
                  location.pathname === "/profile/billing" 
                  ? "bg-gray-100 text-primary" 
                  : "text-gray-700"
                }`}
              >
                <CreditCard className="mr-3 h-5 w-5 text-gray-500" />
                Billing
              </Link>
              <Link 
                to="/profile/notifications" 
                className={`flex items-center px-2 py-2 text-sm rounded-md hover:bg-gray-100 ${
                  location.pathname === "/profile/notifications" 
                  ? "bg-gray-100 text-primary" 
                  : "text-gray-700"
                }`}
              >
                <Bell className="mr-3 h-5 w-5 text-gray-500" />
                Notifications
              </Link>
            </nav>
          </div>
          
          <div className="p-4 border-t">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={logout}
            >
              Log Out
            </Button>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-30 md:hidden"
          onClick={toggle}
        />
      )}
    </>
  );
};

export default ProfileSidebar;
