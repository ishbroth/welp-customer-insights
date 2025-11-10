
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { logger } from '@/utils/logger';
import WelpLoadingIcon from "@/components/ui/WelpLoadingIcon";
import {
  getSavedCredentials,
  saveCredentials,
  clearSavedCredentials,
  setRememberMePreference,
  getRememberMePreference
} from "@/utils/authStorage";
import { isNativeApp } from "@/utils/platform";
import { useHaptics } from "@/hooks/useHaptics";

const Login = () => {
  const pageLogger = logger.withContext('Login');
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, currentUser, session, loading } = useAuth();
  const navigate = useNavigate();
  const haptics = useHaptics();

  // Load saved credentials on mount (if Remember Me was previously checked)
  useEffect(() => {
    // Don't show saved credentials on native apps (they stay logged in)
    if (isNativeApp()) return;

    const savedCredentials = getSavedCredentials();
    const savedRememberMe = getRememberMePreference();

    if (savedCredentials && savedRememberMe) {
      pageLogger.debug("Loading saved credentials for autofill");
      setEmail(savedCredentials.email);
      setPassword(savedCredentials.password);
      setRememberMe(true);
    }
  }, []);

  // Handle navigation when auth state changes
  useEffect(() => {
    pageLogger.debug("🔍 Auth state:", {
      loading,
      hasSession: !!session,
      hasCurrentUser: !!currentUser,
      userId: currentUser?.id
    });

    // Only navigate if we're not loading and have both session and user
    if (!loading && session && currentUser) {
      // Check for redirect parameter
      const redirectUrl = searchParams.get('redirect');
      const destination = redirectUrl ? decodeURIComponent(redirectUrl) : "/profile";

      pageLogger.debug("✅ Auth complete, navigating to:", destination);
      navigate(destination);
    }
  }, [loading, session, currentUser, navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Medium haptic feedback on button press
    haptics.medium();

    setIsSubmitting(true);
    pageLogger.debug("🔐 Starting login process");

    try {
      const result = await login(email, password);

      if (result.success) {
        pageLogger.debug("🔐 Login call successful");

        // Success haptic feedback
        haptics.success();

        // Handle Remember Me preference (only on web browsers, not native apps)
        if (!isNativeApp()) {
          if (rememberMe) {
            // Save credentials for autofill next time
            saveCredentials(email, password);
            setRememberMePreference(true);
            pageLogger.debug("✅ Credentials saved for autofill (Remember Me checked)");
          } else {
            // Clear any previously saved credentials
            clearSavedCredentials();
            setRememberMePreference(false);
            pageLogger.debug("🗑️ Credentials cleared (Remember Me unchecked)");
          }
        }

        // Don't navigate here - let the useEffect handle it based on auth state
        toast.success("Login successful!");
      } else {
        // Error haptic feedback
        haptics.error();
        pageLogger.error("❌ Login failed:", result.error);
        toast.error(result.error || "Login failed");
        setIsSubmitting(false);
      }
    } catch (error) {
      // Error haptic feedback
      haptics.error();
      pageLogger.error("❌ Login error:", error);
      toast.error("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  // Show loading spinner if auth is loading or we're submitting
  if (loading || isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ea384c]">
        <WelpLoadingIcon
          size={120}
          showText={true}
          text={isSubmitting ? "Signing you in..." : "Loading..."}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Welcome back! Please sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            {/* Remember Me checkbox - only shown on web browsers, not native apps */}
            {!isNativeApp() && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label
                  htmlFor="remember-me"
                  className="text-sm font-normal cursor-pointer text-gray-700"
                >
                  Remember me
                </Label>
              </div>
            )}

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          <div className="mt-4 text-center space-y-2">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline block">
              Forgot your password?
            </Link>
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Create one
              </Link>
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mt-3"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Welp.
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
