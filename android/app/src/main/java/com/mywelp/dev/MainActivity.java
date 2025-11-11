package com.mywelp.welp;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Set window background to Welp red to prevent white flash during launch
        // This matches the iOS implementation in AppDelegate.swift
        Window window = getWindow();
        window.setBackgroundDrawableResource(R.color.welpRed);

        // Create notification channel for Android 8.0+ (API 26+)
        createNotificationChannel();
    }

    /**
     * Create notification channel for push notifications
     * Required for Android 8.0 (Oreo) and above
     */
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Welp Notifications";
            String description = "Notifications for reviews, updates, and important information";
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel channel = new NotificationChannel("welp_default", name, importance);
            channel.setDescription(description);

            // Register the channel with the system
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }
}
