
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Bell, BellRing } from "lucide-react";

const NotificationsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser } = useAuth();
  
  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    newReviews: true,
    reviewResponses: true,
    reviewLikes: false,
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
              <Card>
                <CardHeader>
                  <CardTitle>Notification Types</CardTitle>
                  <CardDescription>Select which activities you want to be notified about</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentUser?.type === "business" ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="newReviews">New Customer Reviews</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified when you receive new reviews from customers
                          </p>
                        </div>
                        <Switch 
                          id="newReviews" 
                          checked={notificationPrefs.newReviews}
                          onCheckedChange={() => handleToggleChange("newReviews")}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="reviewLikes">Review Likes</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified when someone likes a review you wrote
                          </p>
                        </div>
                        <Switch 
                          id="reviewLikes" 
                          checked={notificationPrefs.reviewLikes}
                          onCheckedChange={() => handleToggleChange("reviewLikes")}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="newReviews">New Business Reviews</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified when a business writes a new review about you
                          </p>
                        </div>
                        <Switch 
                          id="newReviews" 
                          checked={notificationPrefs.newReviews}
                          onCheckedChange={() => handleToggleChange("newReviews")}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="reviewResponses">Review Responses</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified when businesses respond to reviews about you
                          </p>
                        </div>
                        <Switch 
                          id="reviewResponses" 
                          checked={notificationPrefs.reviewResponses}
                          onCheckedChange={() => handleToggleChange("reviewResponses")}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Notification channels */}
              <Card>
                <CardHeader>
                  <CardTitle>Notification Channels</CardTitle>
                  <CardDescription>Choose how you want to receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email at {currentUser?.email}
                      </p>
                    </div>
                    <Switch 
                      id="emailNotifications" 
                      checked={notificationPrefs.emailNotifications}
                      onCheckedChange={() => handleToggleChange("emailNotifications")}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="pushNotifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications on your devices
                      </p>
                    </div>
                    <Switch 
                      id="pushNotifications" 
                      checked={notificationPrefs.pushNotifications}
                      onCheckedChange={() => handleToggleChange("pushNotifications")}
                    />
                  </div>
                </CardContent>
              </Card>

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
