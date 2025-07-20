

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  Upload, 
  Mail, 
  Users, 
  Settings,
  FlaskConical
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { User } from "@/api/entities";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Import Leads",
    url: createPageUrl("ImportLeads"),
    icon: Upload,
  },
  {
    title: "Email Campaigns",
    url: createPageUrl("EmailCampaigns"),
    icon: Mail,
  },
  {
    title: "All Leads",
    url: createPageUrl("AllLeads"),
    icon: Users,
  },
];

const settingsItems = [
    {
        title: "Settings",
        url: createPageUrl("Settings"),
        icon: Settings,
    }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Authentication check failed:", error); // Added for debugging
      setIsAuthenticated(false);
      setUser(null); // Ensure user is null if not authenticated
    }
  };

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --primary-blue: #3B82F6;
            --primary-blue-light: #EFF6FF;
            --primary-blue-dark: #1E40AF;
            --lab-gray: #F8FAFC;
            --lab-border: #E2E8F0;
            --lab-text: #334155;
            --lab-text-light: #64748B;
          }
          
          .lab-gradient {
            background: linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 100%);
          }
          
          .lab-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid var(--lab-border);
          }
          
          .lab-shadow {
            box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06);
          }
        `}
      </style>
      
      <div className="min-h-screen flex w-full lab-gradient">
        <Sidebar className="border-r border-lab-border bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-lab-border p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center lab-shadow">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-lab-text">MyLabBox</h2>
                <p className="text-xs text-lab-text-light font-medium">Lead Outreach Platform</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-lab-text-light uppercase tracking-wider px-3 py-3">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 rounded-xl group ${
                          location.pathname === item.url ? 'bg-blue-50 text-blue-700 lab-shadow' : 'text-lab-text'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                            location.pathname === item.url ? 'text-blue-600' : 'text-lab-text-light'
                          }`} />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-lab-text-light uppercase tracking-wider px-3 py-3">
                    Account
                </SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu className="space-y-1">
                        {settingsItems.map((item) => (
                             <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton 
                                    asChild 
                                    className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 rounded-xl group ${
                                    location.pathname === item.url ? 'bg-blue-50 text-blue-700 lab-shadow' : 'text-lab-text'
                                    }`}
                                >
                                    <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                                        <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                                            location.pathname === item.url ? 'text-blue-600' : 'text-lab-text-light'
                                        }`} />
                                        <span className="font-medium">{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-lab-border p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <span className="text-lab-text font-semibold text-sm">
                  {isAuthenticated && user?.full_name ? user.full_name[0] : 'M'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-lab-text text-sm truncate">
                  {isAuthenticated && user?.full_name ? user.full_name : 'MyLabBox Team'}
                </p>
                <p className="text-xs text-lab-text-light truncate">
                  {isAuthenticated ? 'Authenticated User' : 'Automate your outreach'}
                </p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-lab-border px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-lab-text">MyLabBox</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

