
import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, BellRing } from 'lucide-react';
import { mobilePushNotificationService } from '@/services/mobilePushNotifications';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/sonner';
import { logger } from '@/utils/logger';

const PushNotificationTest: React.FC = () => {
  const componentLogger = logger.withContext('PushNotificationTest');
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const { currentUser } = useAuth();

  const requestPermissions = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast.error('Push notifications are only available on mobile devices');
      return;
    }

    try {
      setIsLoading(true);
      const hasPermission = await mobilePushNotificationService.requestPermissions();
      
      if (hasPermission) {
        setPermissionStatus('granted');
        toast.success('Push notification permissions granted!');
        
        if (currentUser) {
          await mobilePushNotificationService.initialize(currentUser.id);
        }
      } else {
        setPermissionStatus('denied');
        toast.error('Push notification permissions denied');
      }
    } catch (error) {
      componentLogger.error('Error requesting permissions', { error });
      toast.error('Error requesting push notification permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (!currentUser) {
      toast.error('Please log in to test push notifications');
      return;
    }

    try {
      setIsLoading(true);

      // This would normally be called from the backend
      // For testing, we'll show a local notification
      toast.info('Test Notification', {
        description: 'This is how push notifications will appear in your app!',
      });

    } catch (error) {
      componentLogger.error('Error sending test notification', { error });
      toast.error('Error sending test notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-center flex items-center justify-center gap-2">
          <Bell className="h-6 w-6" />
          Push Notifications Test
        </h2>
        
        <div className="space-y-4">
          <div className="text-sm space-y-2">
            <p><strong>Permission Status:</strong> {permissionStatus}</p>
            <p><strong>Platform:</strong> {Capacitor.getPlatform()}</p>
            <p><strong>Native:</strong> {Capacitor.isNativePlatform() ? 'Yes' : 'No'}</p>
          </div>
          
          <Button 
            onClick={requestPermissions} 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
          >
            <BellRing className="h-5 w-5" />
            {isLoading ? 'Requesting Permissions...' : 'Request Push Permissions'}
          </Button>
          
          <Button 
            onClick={sendTestNotification} 
            disabled={isLoading || permissionStatus !== 'granted'}
            variant="outline"
            className="w-full"
          >
            {isLoading ? 'Sending...' : 'Send Test Notification'}
          </Button>
          
          {!Capacitor.isNativePlatform() && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-800">
                📱 Push notifications will work when running on a mobile device. 
                Currently running in web browser.
              </p>
            </div>
          )}
          
          {currentUser && (
            <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
              <p className="text-sm text-blue-800">
                ✅ Logged in as: {currentUser.email}. Push notifications will be linked to your account.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PushNotificationTest;
