
import React, { useState, useEffect } from "react";
import { Campaign } from "@/api/entities";
import { Lead } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { User } from "@/api/entities"; // Added User import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Users, 
  Send, 
  CheckCircle, 
  Clock, 
  Zap,
  Eye,
  ArrowLeft,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

import GeneratedEmailCard from "../components/campaign/GeneratedEmailCard";
import EmailGenerationProgress from "../components/campaign/EmailGenerationProgress";

export default function CampaignDetails() {
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState(null);

  // Get campaign ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get('id');

  useEffect(() => {
    if (campaignId) {
      loadCampaignData();
    } else {
      setError("No campaign ID provided");
      setIsLoading(false);
    }
  }, [campaignId]);

  const loadCampaignData = async () => {
    setIsLoading(true);
    try {
      // Load campaign details
      const campaignData = await Campaign.list();
      const currentCampaign = campaignData.find(c => c.id === campaignId);
      
      if (!currentCampaign) {
        setError("Campaign not found");
        return;
      }
      
      setCampaign(currentCampaign);

      // Load leads for this campaign
      const allLeads = await Lead.list("-created_date", 1000);
      const campaignLeads = allLeads.filter(lead => 
        lead.campaign_id === campaignId || lead.status === 'new'
      );
      
      setLeads(campaignLeads);
    } catch (error) {
      console.error("Failed to load campaign data:", error);
      setError("Failed to load campaign data");
    }
    setIsLoading(false);
  };

  const generateEmailsForLeads = async () => {
    if (!campaign || leads.length === 0) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);

    try {
      const leadsToProcess = leads.filter(lead => !lead.generated_email);
      const totalLeads = leadsToProcess.length;
      const currentUser = await User.me(); // Fetch current user details
      const signature = currentUser.email_signature || ''; // Get email signature

      for (let i = 0; i < totalLeads; i++) {
        const lead = leadsToProcess[i];
        
        try {
          // Generate personalized email using AI
          const prompt = `
Write a professional, personalized cold outreach email for B2B sales.

SENDER INFORMATION (you):
- Name: ${currentUser.full_name}
- Title: ${currentUser.job_title || ''}

LEAD INFORMATION:
- Name: ${lead.first_name} ${lead.last_name}
- Email: ${lead.email}
- Company: ${lead.company || 'their company'}
- Title: ${lead.title || 'their role'}
- Industry: ${lead.industry || 'their industry'}

EMAIL TEMPLATE TO PERSONALIZE:
${campaign.email_template}

INSTRUCTIONS:
1. Replace placeholders like {{first_name}}, {{company}}, {{title}} with actual values.
2. Make it sound natural and personalized.
3. Keep it professional but friendly.
4. Include a clear call-to-action.
5. Make it concise (under 150 words).
6. Don't use "I hope this email finds you well" or similar generic openings.
7. Be specific about why you're reaching out to them specifically.
8. Append the following signature at the end of the email body exactly as it is provided:
---
${signature}
---

Return the email in this JSON format:
{
  "subject": "Compelling subject line (under 50 characters)",
  "body": "The full email body, including the signature."
}
`;

          const response = await InvokeLLM({
            prompt: prompt,
            response_json_schema: {
              type: "object",
              properties: {
                subject: { type: "string" },
                body: { type: "string" }
              }
            }
          });

          // Update lead with generated email
          await Lead.update(lead.id, {
            generated_email: response.body,
            email_subject: response.subject,
            status: 'email_generated',
            campaign_id: campaignId
          });

          // Update progress
          const progress = ((i + 1) / totalLeads) * 100;
          setGenerationProgress(progress);
          
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
          console.error(`Failed to generate email for lead ${lead.id}:`, error);
          // Continue with other leads even if one fails
        }
      }

      // Reload leads to show updated data
      await loadCampaignData();

    } catch (error) {
      console.error("Error generating emails:", error);
      setError("Failed to generate emails. Please try again.");
    }

    setIsGenerating(false);
  };

  const handleApproveEmail = async (leadId) => {
    try {
      await Lead.update(leadId, { status: 'approved' });
      await loadCampaignData();
    } catch (error) {
      console.error("Failed to approve email:", error);
    }
  };

  const handleEditEmail = async (leadId, newContent, newSubject) => {
    try {
      await Lead.update(leadId, {
        generated_email: newContent,
        email_subject: newSubject,
        status: 'approved'
      });
      await loadCampaignData();
    } catch (error) {
      console.error("Failed to update email:", error);
    }
  };

  const handleSendEmails = async () => {
    const approvedLeads = leads.filter(lead => lead.status === 'approved');
    
    if (approvedLeads.length === 0) {
      alert("No approved emails to send. Please approve emails first.");
      return;
    }

    try {
      // Update all approved leads to 'sent' status
      for (const lead of approvedLeads) {
        await Lead.update(lead.id, { status: 'sent' });
      }

      // Update campaign stats
      await Campaign.update(campaignId, {
        emails_sent: (campaign.emails_sent || 0) + approvedLeads.length,
        total_leads: leads.length
      });

      alert(`Successfully sent ${approvedLeads.length} emails!`);
      await loadCampaignData();

    } catch (error) {
      console.error("Failed to send emails:", error);
      alert("Failed to send emails. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="ml-4 text-lab-text">Loading campaign...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error || "Campaign not found"}
              <Link to={createPageUrl("EmailCampaigns")} className="ml-4">
                <Button variant="outline" size="sm">
                  Back to Campaigns
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const stats = {
    totalLeads: leads.length,
    generated: leads.filter(l => l.status === 'email_generated' || l.status === 'approved' || l.status === 'sent').length,
    approved: leads.filter(l => l.status === 'approved').length,
    sent: leads.filter(l => l.status === 'sent').length
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-lab-text flex items-center gap-3">
              <Mail className="w-8 h-8" />
              {campaign.name}
            </h1>
            <p className="text-lab-text-light mt-1">{campaign.description}</p>
          </div>
          
          <div className="flex gap-3">
            <Link to={createPageUrl("EmailCampaigns")}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Campaigns
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="lab-card">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-lab-text">{stats.totalLeads}</p>
              <p className="text-sm text-lab-text-light">Total Leads</p>
            </CardContent>
          </Card>
          
          <Card className="lab-card">
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-lab-text">{stats.generated}</p>
              <p className="text-sm text-lab-text-light">Emails Generated</p>
            </CardContent>
          </Card>
          
          <Card className="lab-card">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-lab-text">{stats.approved}</p>
              <p className="text-sm text-lab-text-light">Approved</p>
            </CardContent>
          </Card>
          
          <Card className="lab-card">
            <CardContent className="p-6 text-center">
              <Send className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-lab-text">{stats.sent}</p>
              <p className="text-sm text-lab-text-light">Sent</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button 
            onClick={generateEmailsForLeads}
            disabled={isGenerating || leads.filter(l => !l.generated_email).length === 0}
            className="bg-purple-600 hover:bg-purple-700 gap-2"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {isGenerating ? 'Generating...' : `Generate Emails (${leads.filter(l => !l.generated_email).length})`}
          </Button>
          
          <Button 
            onClick={handleSendEmails}
            disabled={stats.approved === 0}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            <Send className="w-4 h-4" />
            Send Approved Emails ({stats.approved})
          </Button>
        </div>

        {/* Generation Progress */}
        {isGenerating && (
          <EmailGenerationProgress progress={generationProgress} />
        )}

        {/* Email List */}
        <Card className="lab-card">
          <CardHeader>
            <CardTitle>Generated Emails</CardTitle>
          </CardHeader>
          <CardContent>
            {leads.length > 0 ? (
              <div className="space-y-4">
                {leads.map((lead) => (
                  <GeneratedEmailCard
                    key={lead.id}
                    lead={lead}
                    onApprove={() => handleApproveEmail(lead.id)}
                    onEdit={handleEditEmail}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-lab-text-light mx-auto mb-4" />
                <p className="text-lab-text-light">No leads in this campaign yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
