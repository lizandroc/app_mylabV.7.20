import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, SettingsIcon, CheckCircle, LogOut, LogIn, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState({ job_title: "", email_signature: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        setIsAuthenticated(true);
        setPreferences({
          job_title: currentUser.job_title || "",
          email_signature: currentUser.email_signature || `Best regards,\n${currentUser.full_name}`,
        });
      } catch (error) {
        console.log("User not authenticated:", error);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };
    loadUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await User.updateMyUserData(preferences);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to save preferences", error);
      alert("Failed to save. Please try again.");
    }
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await User.logout();
      window.location.reload();
    } catch (error) {
      console.error("Failed to sign out", error);
      alert("Failed to sign out. Please try again.");
      setIsSigningOut(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setAuthError(null);
      const currentUrl = window.location.origin + window.location.pathname;
      console.log("Settings: Attempting login with redirect to:", currentUrl);
      
      await User.loginWithRedirect(currentUrl);
    } catch (error) {
      console.error("LoginWithRedirect failed, trying basic login:", error);
      try {
        await User.login();
      } catch (fallbackError) {
        console.error("Both login methods failed:", fallbackError);
        setAuthError("Unable to sign in. Please try again or contact support.");
      }
    }
  };
  
  if (isLoading) {
    return (
        <div className="p-6 md:p-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
    );
  }

  // Show sign in option if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold text-lab-text flex items-center gap-3">
                <SettingsIcon className="w-8 h-8" />
                Settings
              </h1>
              <p className="text-lab-text-light mt-1">
                Sign in to manage your preferences and account settings.
              </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="lab-card lab-shadow">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LogIn className="w-5 h-5" />
                        Authentication Required
                      </CardTitle>
                      <CardDescription>
                          Please sign in to access your account settings and preferences.
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      {authError && (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800">
                            {authError}
                          </AlertDescription>
                        </Alert>
                      )}
                      <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                              You need to be signed in to view and modify your settings.
                          </AlertDescription>
                      </Alert>
                      <Button 
                          onClick={handleSignIn} 
                          className="bg-blue-600 hover:bg-blue-700 w-full gap-2"
                      >
                          <LogIn className="w-4 h-4" />
                          Sign In with Google
                      </Button>
                  </CardContent>
              </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-lab-text flex items-center gap-3">
              <SettingsIcon className="w-8 h-8" />
              Settings
            </h1>
            <p className="text-lab-text-light mt-1">
              Manage your personal information and email preferences.
            </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="lab-card lab-shadow">
                <CardHeader>
                    <CardTitle>User Profile</CardTitle>
                    <CardDescription>
                        This information will be used in your email signatures.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <label className="font-medium text-lab-text mb-2 block">Full Name</label>
                        <Input value={user?.full_name || ""} disabled />
                        <p className="text-xs text-lab-text-light mt-1">Your name is managed via your account provider.</p>
                    </div>
                    <div>
                        <label className="font-medium text-lab-text mb-2 block">Email Address</label>
                        <Input value={user?.email || ""} disabled />
                    </div>
                    <div>
                        <label htmlFor="job_title" className="font-medium text-lab-text mb-2 block">Job Title</label>
                        <Input 
                            id="job_title"
                            name="job_title"
                            placeholder="e.g., Sales Manager, CEO"
                            value={preferences.job_title}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="email_signature" className="font-medium text-lab-text mb-2 block">Email Signature</label>
                        <Textarea 
                            id="email_signature"
                            name="email_signature"
                            placeholder="Your email signature..."
                            value={preferences.email_signature}
                            onChange={handleInputChange}
                            rows={5}
                        />
                        <p className="text-xs text-lab-text-light mt-1">This will be appended to all generated emails.</p>
                    </div>
                    <div className="flex justify-end items-center gap-4">
                        {showSuccess && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                className="flex items-center gap-2 text-green-600"
                            >
                                <CheckCircle className="w-4 h-4"/>
                                <span>Saved!</span>
                            </motion.div>
                        )}
                        <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 w-32">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : "Save Preferences"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="lab-card lab-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LogOut className="w-5 h-5" />
                        Account Management
                    </CardTitle>
                    <CardDescription>
                        Manage your account authentication and session.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-lab-gray rounded-lg">
                        <div>
                            <p className="font-medium text-lab-text">Current Session</p>
                            <p className="text-sm text-lab-text-light">
                                Signed in as {user?.full_name} ({user?.email})
                            </p>
                        </div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-medium text-lab-text">Sign Out</p>
                            <p className="text-sm text-lab-text-light">
                                Sign out of your account on this device
                            </p>
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                            className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                        >
                            {isSigningOut ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <LogOut className="w-4 h-4" />
                            )}
                            {isSigningOut ? "Signing Out..." : "Sign Out"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
      </div>
    </div>
  );
}