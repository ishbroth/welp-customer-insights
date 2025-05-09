import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Bell, BellRing } from "lucide-react";
import NotificationTypes from "@/components/notifications/NotificationTypes";
import NotificationChannels from "@/components/notifications/NotificationChannels";

const NotificationsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser } = useAuth();
  
  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    reviewReactions: true,
    customerResponses: true,
    newReviews: true, // For customers only
    reviewResponses: true, // For customers only
    emailNotifications: true,
    pushNotifications: false,
  });

  // Handle toggle changes
  const handleToggleChange = (key: keyof typeof notificationPrefs) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Save notification preferences
  const handleSavePreferences = () => {
    // In a real app, this would save to a database
    toast("Notification preferences saved successfully", {
      description: "Your notification settings have been updated",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row">
        <ProfileSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-3xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Bell className="h-6 w-6" /> Notification Preferences
              </h1>
              <p className="text-gray-600 mt-2">
                Control how and when you receive notifications about review activity
              </p>
            </div>

            <div className="space-y-6">
              {/* Notification types */}
              <NotificationTypes 
                notificationPrefs={notificationPrefs} 
                handleToggleChange={handleToggleChange}
                userType={currentUser?.type}
              />

              {/* Notification channels */}
              <NotificationChannels 
                emailNotifications={notificationPrefs.emailNotifications}
                pushNotifications={notificationPrefs.pushNotifications}
                handleToggleChange={handleToggleChange}
                userEmail={currentUser?.email}
              />

              <div className="flex justify-end">
                <Button onClick={handleSavePreferences} className="px-6">
                  <BellRing className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default NotificationsPage;
