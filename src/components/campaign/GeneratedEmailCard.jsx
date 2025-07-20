import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle, 
  Edit, 
  Mail, 
  User, 
  Building2,
  Send,
  Clock,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

const statusConfig = {
  new: { color: "bg-gray-100 text-gray-800", icon: Clock, label: "New" },
  email_generated: { color: "bg-blue-100 text-blue-800", icon: Mail, label: "Generated" },
  approved: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Approved" },
  sent: { color: "bg-purple-100 text-purple-800", icon: Send, label: "Sent" }
};

export default function GeneratedEmailCard({ lead, onApprove, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubject, setEditedSubject] = useState(lead.email_subject || '');
  const [editedContent, setEditedContent] = useState(lead.generated_email || '');

  const config = statusConfig[lead.status] || statusConfig.new;
  const StatusIcon = config.icon;

  const handleSaveEdit = () => {
    onEdit(lead.id, editedContent, editedSubject);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedSubject(lead.email_subject || '');
    setEditedContent(lead.generated_email || '');
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      {/* Lead Info Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-lab-text">
              {lead.first_name} {lead.last_name}
            </p>
            <div className="flex items-center gap-2 text-sm text-lab-text-light">
              <Mail className="w-4 h-4" />
              <span>{lead.email}</span>
              {lead.company && (
                <>
                  <span>•</span>
                  <Building2 className="w-4 h-4" />
                  <span>{lead.company}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={`${config.color} border-0`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </div>

      {/* Email Content */}
      {lead.generated_email ? (
        <div className="space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-lab-text mb-1 block">
                  Subject Line
                </label>
                <Input
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  placeholder="Email subject..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-lab-text mb-1 block">
                  Email Content
                </label>
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-lab-gray p-3 rounded-lg">
                <p className="text-sm font-medium text-lab-text mb-1">Subject:</p>
                <p className="text-lab-text">{lead.email_subject}</p>
              </div>
              <div className="bg-lab-gray p-3 rounded-lg">
                <p className="text-sm font-medium text-lab-text mb-2">Email Content:</p>
                <div className="whitespace-pre-wrap text-sm text-lab-text leading-relaxed">
                  {lead.generated_email}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isEditing && (
            <div className="flex justify-end gap-2 pt-2">
              {lead.status === 'email_generated' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    onClick={onApprove}
                    className="bg-green-600 hover:bg-green-700 gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                </>
              )}
              
              {lead.status === 'approved' && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 bg-lab-gray rounded-lg">
          <Zap className="w-8 h-8 text-lab-text-light mx-auto mb-2" />
          <p className="text-lab-text-light">Email not generated yet</p>
        </div>
      )}
    </motion.div>
  );
}