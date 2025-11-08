package com.mywelp.dev;

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
    }
}