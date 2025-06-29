
import React from 'react';
import { Capacitor } from '@capacitor/core';
import CameraTest from './CameraTest';
import PushNotificationTest from './PushNotificationTest';
import { Card, CardContent } from '@/components/ui/card';

const MobileTestPage: React.FC = () => {
  const platform = Capacitor.getPlatform();
  const isNative = Capacitor.isNativePlatform();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Mobile App Test</h1>
      
      <Card className="max-w-md mx-auto mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Platform Info</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Platform:</strong> {platform}</p>
            <p><strong>Native:</strong> {isNative ? 'Yes' : 'No'}</p>
            <p><strong>Status:</strong> {isNative ? '📱 Running on mobile' : '🌐 Running in browser'}</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <CameraTest />
        <PushNotificationTest />
      </div>
    </div>
  );
};

export default MobileTestPage;
