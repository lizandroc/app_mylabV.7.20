
import React, { useState, useEffect } from "react";
import { Campaign } from "@/api/entities";
import { Lead } from "@/api/entities";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Plus, Loader2, ArrowRight, BarChart2, Users, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const CampaignCard = ({ campaign }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lab-card lab-shadow overflow-hidden"
    >
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-lab-text">{campaign.name}</CardTitle>
                    <CardDescription className="text-lab-text-light mt-1">{campaign.description}</CardDescription>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    'bg-orange-100 text-orange-800'
                }`}>
                    {campaign.status}
                </div>
            </div>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-center">
            <div>
                <p className="text-2xl font-bold text-lab-text">{campaign.total_leads || 0}</p>
                <p className="text-sm text-lab-text-light">Leads</p>
            </div>
            <div>
                <p className="text-2xl font-bold text-lab-text">{campaign.emails_sent || 0}</p>
                <p className="text-sm text-lab-text-light">Sent</p>
            </div>
            <div>
                <p className="text-2xl font-bold text-lab-text">{campaign.responses_received || 0}</p>
                <p className="text-sm text-lab-text-light">Responses</p>
            </div>
        </CardContent>
        <CardFooter className="bg-lab-gray/50 px-6 py-4 flex justify-end">
            <Button variant="outline" asChild>
                <Link to={createPageUrl(`CampaignDetails?id=${campaign.id}`)} className="gap-2">
                    View Details <ArrowRight className="w-4 h-4" />
                </Link>
            </Button>
        </CardFooter>
    </motion.div>
);

export default function EmailCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    email_template: "Hi {{first_name}},\n\nI saw you work at {{company}} and thought I'd reach out.\n\nBest regards,",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const allCampaigns = await Campaign.list("-created_date", 100);
      setCampaigns(allCampaigns);
    } catch (error) {
      console.error("Failed to load campaigns:", error);
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCampaign(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCampaign = async () => {
    if (!newCampaign.name || !newCampaign.email_template) {
        alert("Campaign Name and Email Template are required.");
        return;
    }
    setIsSaving(true);
    try {
        await Campaign.create({
            ...newCampaign,
            status: 'draft'
        });
        setShowForm(false);
        setNewCampaign({ name: "", description: "", email_template: "Hi {{first_name}},\n\nI saw you work at {{company}} and thought I'd reach out.\n\nBest regards," });
        loadCampaigns();
    } catch (error) {
        console.error("Failed to save campaign", error);
        alert("Failed to save campaign. Please try again.");
    }
    setIsSaving(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-lab-text flex items-center gap-3">
              <Mail className="w-8 h-8" />
              Email Campaigns
            </h1>
            <p className="text-lab-text-light mt-1">
              Create, manage, and track your outreach campaigns.
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
        </motion.div>

        <AnimatePresence>
            {showForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    className="mb-8 overflow-hidden"
                >
                    <Card className="lab-card lab-shadow">
                        <CardHeader>
                            <CardTitle>Create New Campaign</CardTitle>
                            <CardDescription>
                                Set up the details for your new outreach campaign. You can add leads later.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                name="name"
                                placeholder="Campaign Name (e.g., 'Q3 Tech Outreach')"
                                value={newCampaign.name}
                                onChange={handleInputChange}
                            />
                            <Input
                                name="description"
                                placeholder="Campaign Description (e.g., 'Targeting CTOs in FinTech')"
                                value={newCampaign.description}
                                onChange={handleInputChange}
                            />
                            <Textarea
                                name="email_template"
                                placeholder="Your email template here... Use placeholders like {{first_name}}, {{company}}, etc."
                                value={newCampaign.email_template}
                                onChange={handleInputChange}
                                rows={8}
                                className="font-mono text-sm"
                            />
                             <div className="text-xs text-lab-text-light bg-lab-gray p-2 rounded-md">
                                Use placeholders: `{"{{first_name}}"}`, `{"{{last_name}}"}`, `{"{{company}}"}`, `{"{{title}}"}`
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button onClick={handleSaveCampaign} disabled={isSaving} className="gap-2">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus />}
                                Save Campaign
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>

        {isLoading ? (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="ml-4 text-lab-text">Loading campaigns...</p>
            </div>
        ) : (
            campaigns.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {campaigns.map(campaign => <CampaignCard key={campaign.id} campaign={campaign} />)}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed border-lab-border rounded-xl">
                    <Mail className="w-12 h-12 text-lab-text-light mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-lab-text">No campaigns yet</h3>
                    <p className="text-lab-text-light mt-2 mb-6">Click "New Campaign" to get started.</p>
                    <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                        Create Your First Campaign
                    </Button>
                </div>
            )
        )}
      </div>
    </div>
  );
}
