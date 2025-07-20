import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Users, 
  CheckCircle, 
  X, 
  Mail,
  Building2,
  User
} from "lucide-react";

export default function LeadPreview({ leads, onImport, onCancel, isImporting, progress }) {
  const validLeads = leads.filter(lead => lead.first_name && lead.email);
  const invalidLeads = leads.length - validLeads.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="lab-card lab-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lead Preview ({validLeads.length} valid leads)
            </CardTitle>
            {invalidLeads > 0 && (
              <Badge variant="destructive">
                {invalidLeads} invalid leads (missing required fields)
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isImporting ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-lab-text mb-2">Importing leads...</h3>
              <p className="text-lab-text-light mb-4">Adding leads to your database</p>
              <Progress value={progress} className="w-full max-w-md mx-auto" />
              <p className="text-sm text-lab-text-light mt-2">{Math.round(progress)}% complete</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-lab-gray rounded-lg">
                  <p className="text-2xl font-bold text-lab-text">{validLeads.length}</p>
                  <p className="text-sm text-lab-text-light">Valid Leads</p>
                </div>
                <div className="text-center p-4 bg-lab-gray rounded-lg">
                  <p className="text-2xl font-bold text-lab-text">
                    {validLeads.filter(l => l.company).length}
                  </p>
                  <p className="text-sm text-lab-text-light">With Company</p>
                </div>
                <div className="text-center p-4 bg-lab-gray rounded-lg">
                  <p className="text-2xl font-bold text-lab-text">
                    {validLeads.filter(l => l.title).length}
                  </p>
                  <p className="text-sm text-lab-text-light">With Job Title</p>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {validLeads.slice(0, 10).map((lead, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-lab-gray rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-lab-text">
                            {lead.first_name} {lead.last_name}
                          </p>
                          <Mail className="w-4 h-4 text-lab-text-light" />
                          <p className="text-sm text-lab-text-light">{lead.email}</p>
                        </div>
                        {(lead.company || lead.title) && (
                          <div className="flex items-center gap-2 mt-1">
                            {lead.company && (
                              <>
                                <Building2 className="w-4 h-4 text-lab-text-light" />
                                <p className="text-sm text-lab-text-light">{lead.company}</p>
                              </>
                            )}
                            {lead.title && (
                              <>
                                <span className="text-lab-text-light">•</span>
                                <p className="text-sm text-lab-text-light">{lead.title}</p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {validLeads.length > 10 && (
                    <div className="text-center py-4 text-lab-text-light">
                      ... and {validLeads.length - 10} more leads
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {!isImporting && (
          <CardFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel} className="gap-2">
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button 
              onClick={onImport} 
              className="bg-blue-600 hover:bg-blue-700 gap-2"
              disabled={validLeads.length === 0}
            >
              <CheckCircle className="w-4 h-4" />
              Import {validLeads.length} Leads
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}