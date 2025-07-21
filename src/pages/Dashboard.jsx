import React, { useState, useEffect } from "react";
import { Lead } from "@/api/entities";
import { Campaign } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Users, 
  Mail, 
  TrendingUp, 
  Clock,
  Upload,
  Plus,
  CheckCircle,
  AlertCircle,
  LogIn
} from "lucide-react";
import { motion } from "framer-motion";

import StatsCard from "../components/dashboard/StatsCard";
import RecentActivity from "../components/dashboard/RecentActivity";
import QuickActions from "../components/dashboard/QuickActions";

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Changed to false by default
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Only check authentication silently, don't redirect automatically
    checkAuthenticationSilently();
  }, []);

  const checkAuthenticationSilently = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      // Only load data if user is authenticated
      await loadUserData();
    } catch (error) {
      // Silently handle authentication failure - don't redirect or show errors
      console.log("User not authenticated (this is normal for public visitors)");
      setIsAuthenticated(false);
    }
    setHasCheckedAuth(true);
  };

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const [leadsData, campaignsData] = await Promise.all([
        Lead.list("-created_date", 100),
        Campaign.list("-created_date", 20)
      ]);
      setLeads(leadsData);
      setCampaigns(campaignsData);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
    setIsLoading(false);
  };

  const handleSignIn = async () => {
    try {
      setAuthError(null);
      // Get the current URL for redirect after login
      const currentUrl = window.location.origin + window.location.pathname;
      console.log("Attempting login with redirect to:", currentUrl);
      
      // Try the loginWithRedirect method first
      await User.loginWithRedirect(currentUrl);
    } catch (error) {
      console.error("LoginWithRedirect failed, trying basic login:", error);
      try {
        // Fallback to basic login
        await User.login();
      } catch (fallbackError) {
        console.error("Both login methods failed:", fallbackError);
        setAuthError("Unable to sign in. Please try again or contact support.");
      }
    }
  };

  const getStats = () => {
    const totalLeads = leads.length;
    const emailsGenerated = leads.filter(lead => lead.status === 'email_generated' || lead.status === 'approved' || lead.status === 'sent').length;
    const emailsSent = leads.filter(lead => lead.status === 'sent').length;
    const responses = leads.filter(lead => lead.status === 'responded').length;
    const responseRate = emailsSent > 0 ? ((responses / emailsSent) * 100).toFixed(1) : 0;

    return {
      totalLeads,
      emailsGenerated,
      emailsSent,
      responses,
      responseRate
    };
  };

  const stats = getStats();

  // Show loading only if we haven't checked auth yet
  if (!hasCheckedAuth) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lab-text">Loading MyLabBox...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show public landing page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-6 md:p-8 space-y-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-lab-text mb-4">
              Welcome to MyLabBox
            </h1>
            <p className="text-xl text-lab-text-light mb-8">
              AI-Powered B2B Lead Outreach Platform
            </p>
            
            {authError && (
              <Alert className="max-w-md mx-auto mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {authError}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleSignIn}
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3 gap-2"
              >
                <LogIn className="w-5 h-5" />
                Sign In to Get Started
              </Button>
              <Button 
                variant="outline"
                className="text-lg px-8 py-3"
                onClick={() => {
                  document.getElementById('demo-features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                View Demo Features
              </Button>
            </div>
          </motion.div>

          {/* Demo Features Section */}
          <div id="demo-features" className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold text-lab-text mb-4">Platform Features</h2>
              <p className="text-lab-text-light">See what you can do with MyLabBox</p>
            </motion.div>

            {/* Demo Stats Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <StatsCard
                title="Import Leads"
                value="CSV"
                icon={Users}
                color="blue"
                trend="Bulk import from files"
              />
              
              <StatsCard
                title="AI Email Generation"
                value="GPT"
                icon={Mail}
                color="purple"
                trend="Personalized outreach"
              />
              
              <StatsCard
                title="Campaign Management"
                value="Pro"
                icon={CheckCircle}
                color="green"
                trend="Track performance"
              />
              
              <StatsCard
                title="Response Tracking"
                value="Analytics"
                icon={TrendingUp}
                color="orange"
                trend="Monitor success rates"
              />
            </motion.div>

            {/* Feature Cards */}
            <div className="grid lg:grid-cols-2 gap-8 mt-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="lab-card lab-shadow h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5 text-blue-600" />
                      Lead Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-lab-text-light">
                      <li>• Import leads from CSV files</li>
                      <li>• Automatic data validation</li>
                      <li>• Smart column mapping</li>
                      <li>• Contact organization</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="lab-card lab-shadow h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-purple-600" />
                      AI-Powered Emails
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-lab-text-light">
                      <li>• Personalized email generation</li>
                      <li>• Custom templates</li>
                      <li>• Professional signatures</li>
                      <li>• Review before sending</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center py-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl"
            >
              <h3 className="text-2xl font-bold text-lab-text mb-4">
                Ready to Transform Your Outreach?
              </h3>
              <p className="text-lab-text-light mb-6">
                Join thousands of sales professionals using AI to scale their outreach
              </p>
              <Button 
                onClick={handleSignIn}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <LogIn className="w-5 h-5" />
                Get Started Free
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated user dashboard
  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-lab-text mb-2">
              Welcome back, {user?.full_name?.split(' ')[0]}
            </h1>
            <p className="text-lab-text-light text-lg">
              Your B2B outreach campaigns at a glance
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link to={createPageUrl("ImportLeads")}>
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Import Leads
              </Button>
            </Link>
            <Link to={createPageUrl("EmailCampaigns")}>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Plus className="w-4 h-4" />
                New Campaign
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatsCard
            title="Total Leads"
            value={stats.totalLeads}
            icon={Users}
            color="blue"
            trend={`+${leads.filter(l => {
              const created = new Date(l.created_date);
              const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              return created > weekAgo;
            }).length} this week`}
          />
          
          <StatsCard
            title="Emails Generated"
            value={stats.emailsGenerated}
            icon={Mail}
            color="purple"
            trend={`${((stats.emailsGenerated / stats.totalLeads) * 100 || 0).toFixed(0)}% of leads`}
          />
          
          <StatsCard
            title="Emails Sent"
            value={stats.emailsSent}
            icon={CheckCircle}
            color="green"
            trend={`${stats.responseRate}% response rate`}
          />
          
          <StatsCard
            title="Responses"
            value={stats.responses}
            icon={TrendingUp}
            color="orange"
            trend={stats.responses > 0 ? "Active conversations" : "No responses yet"}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <RecentActivity leads={leads} isLoading={isLoading} />
          </div>
          
          <div className="space-y-6">
            <QuickActions />
            
            {/* Recent Campaigns */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="lab-card lab-shadow">
                <CardHeader>
                  <CardTitle className="text-lab-text">Recent Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  {campaigns.length > 0 ? (
                    <div className="space-y-3">
                      {campaigns.slice(0, 5).map((campaign) => (
                        <div key={campaign.id} className="flex items-center justify-between p-3 rounded-lg bg-lab-gray">
                          <div>
                            <p className="font-medium text-lab-text">{campaign.name}</p>
                            <p className="text-sm text-lab-text-light">
                              {campaign.total_leads} leads • {campaign.emails_sent} sent
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {campaign.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <AlertCircle className="w-8 h-8 text-lab-text-light mx-auto mb-2" />
                      <p className="text-lab-text-light">No campaigns yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}