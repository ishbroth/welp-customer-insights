
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface PushNotificationService {
  requestPermissions: () => Promise<boolean>;
  registerForPushNotifications: () => Promise<string | null>;
  initialize: (userId: string) => Promise<void>;
  cleanup: () => void;
}

class MobilePushNotificationService implements PushNotificationService {
  private userId: string | null = null;
  private isInitialized = false;

  async requestPermissions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications are only available on native platforms');
      return false;
    }

    try {
      const permission = await PushNotifications.requestPermissions();
      return permission.receive === 'granted';
    } catch (error) {
      console.error('Error requesting push notification permissions:', error);
      return false;
    }
  }

  async registerForPushNotifications(): Promise<string | null> {
    if (!Capacitor.isNativePlatform()) {
      return null;
    }

    try {
      await PushNotifications.register();
      
      return new Promise((resolve) => {
        // Listen for registration
        PushNotifications.addListener('registration', (token: Token) => {
          console.log('Push registration success, token: ', token.value);
          resolve(token.value);
        });

        // Listen for registration errors
        PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Error on registration: ', error);
          resolve(null);
        });
      });
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  async initialize(userId: string): Promise<void> {
    if (this.isInitialized || !Capacitor.isNativePlatform()) {
      return;
    }

    this.userId = userId;

    try {
      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Push notification permissions not granted');
        return;
      }

      // Register for push notifications
      const token = await this.registerForPushNotifications();
      if (token) {
        // Store the token in the database for this user
        await this.storeDeviceToken(userId, token);
      }

      // Set up listeners for incoming notifications
      this.setupNotificationListeners();

      this.isInitialized = true;
      console.log('Push notifications initialized successfully');
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  private async storeDeviceToken(userId: string, token: string): Promise<void> {
    try {
      // Store or update the device token for this user
      const { error } = await supabase
        .from('device_tokens')
        .upsert({
          user_id: userId,
          token: token,
          platform: Capacitor.getPlatform(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing device token:', error);
      } else {
        console.log('Device token stored successfully');
      }
    } catch (error) {
      console.error('Error storing device token:', error);
    }
  }

  private setupNotificationListeners(): void {
    // Listen for notifications received while app is in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push notification received: ', notification);
      
      // Show a toast notification in the app
      toast.info(notification.title || 'New Notification', {
        description: notification.body,
      });
    });

    // Listen for notifications tapped/clicked
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Push notification action performed: ', notification);
      
      // Handle notification tap - could navigate to specific page
      const data = notification.notification.data;
      if (data?.reviewId) {
        // Navigate to specific review or profile page
        console.log('Navigate to review:', data.reviewId);
      }
    });
  }

  cleanup(): void {
    if (Capacitor.isNativePlatform()) {
      PushNotifications.removeAllListeners();
    }
    this.isInitialized = false;
    this.userId = null;
  }
}

// Create and export a singleton instance
export const mobilePushNotificationService = new MobilePushNotificationService();
