import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { User, Mail, CheckCircle, Clock } from "lucide-react";

const statusConfig = {
  new: { color: "bg-gray-100 text-gray-800", icon: User },
  email_generated: { color: "bg-blue-100 text-blue-800", icon: Mail },
  approved: { color: "bg-purple-100 text-purple-800", icon: CheckCircle },
  sent: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  responded: { color: "bg-orange-100 text-orange-800", icon: Mail }
};

export default function RecentActivity({ leads, isLoading }) {
  const recentLeads = leads
    .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
    .slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="lab-card lab-shadow">
        <CardHeader>
          <CardTitle className="text-lab-text flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-lab-gray h-10 w-10"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-lab-gray rounded w-3/4"></div>
                      <div className="h-3 bg-lab-gray rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {recentLeads.map((lead) => {
                  const config = statusConfig[lead.status];
                  const StatusIcon = config.icon;
                  
                  return (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-lab-gray transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <StatusIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-lab-text">
                            {lead.first_name} {lead.last_name}
                          </p>
                          <Badge className={`${config.color} border-0`}>
                            {lead.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-lab-text-light">{lead.company}</p>
                          <span className="text-lab-text-light">•</span>
                          <p className="text-sm text-lab-text-light">{lead.title}</p>
                        </div>
                        <p className="text-xs text-lab-text-light mt-1">
                          {format(new Date(lead.updated_date), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {recentLeads.length === 0 && (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-lab-text-light mx-auto mb-4" />
                  <p className="text-lab-text-light">No recent activity</p>
                  <p className="text-sm text-lab-text-light mt-1">Import leads to get started</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}