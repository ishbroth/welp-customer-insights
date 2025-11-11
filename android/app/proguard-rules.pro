# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Capacitor WebView Bridge - DO NOT REMOVE
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * {
    @com.getcapacitor.annotation.PermissionCallback *;
    @com.getcapacitor.annotation.ActivityCallback *;
    @com.getcapacitor.PluginMethod public *;
}
-keepclassmembers class * {
    @com.getcapacitor.annotation.PermissionCallback *;
    @com.getcapacitor.annotation.ActivityCallback *;
}

# WebView JavaScript Interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep all plugin classes
-keep class com.aparajita.capacitor.** { *; }
-keep class io.ionic.** { *; }

# AndroidX and Material
-keep class androidx.** { *; }
-keep class com.google.android.material.** { *; }

# Biometric Auth Plugin
-keep class com.aparajita.capacitor.biometricauth.** { *; }

# Keep native method names
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep Parcelables
-keepclassmembers class * implements android.os.Parcelable {
    public static final ** CREATOR;
}

# Keep Serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Remove logging in release
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}
