import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Upload, Mail, Users, Zap, Bot } from "lucide-react";

const actions = [
  {
    title: "Import Leads",
    description: "Upload CSV file with new leads",
    icon: Upload,
    url: "ImportLeads",
    bgColor: "bg-blue-100",
    textColor: "text-blue-600"
  },
  {
    title: "Create Campaign", 
    description: "Start a new email campaign",
    icon: Mail,
    url: "EmailCampaigns",
    bgColor: "bg-purple-100",
    textColor: "text-purple-600"
  },
  {
    title: "Generate AI Emails",
    description: "AI-powered personalized emails",
    icon: Bot,
    url: "EmailCampaigns",
    bgColor: "bg-green-100",
    textColor: "text-green-600"
  },
  {
    title: "View All Leads",
    description: "Manage your lead database",
    icon: Users, 
    url: "AllLeads",
    bgColor: "bg-orange-100",
    textColor: "text-orange-600"
  }
];

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="lab-card lab-shadow">
        <CardHeader>
          <CardTitle className="text-lab-text flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {actions.map((action) => (
            <Link key={action.title} to={createPageUrl(action.url)}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-4 hover:bg-lab-gray"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${action.bgColor}`}>
                      <action.icon className={`w-4 h-4 ${action.textColor}`} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-lab-text">{action.title}</p>
                      <p className="text-sm text-lab-text-light">{action.description}</p>
                    </div>
                  </div>
                </Button>
              </motion.div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}