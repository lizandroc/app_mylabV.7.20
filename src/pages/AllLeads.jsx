
import React, { useState, useEffect, useMemo } from "react";
import { Lead } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Users, 
  Search, 
  Trash2, 
  ArrowUpDown,
  Plus,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

const statusConfig = {
  new: { color: "bg-gray-100 text-gray-800" },
  email_generated: { color: "bg-blue-100 text-blue-800" },
  approved: { color: "bg-purple-100 text-purple-800" },
  sent: { color: "bg-green-100 text-green-800" },
  responded: { color: "bg-orange-100 text-orange-800" }
};

export default function AllLeads() {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: 'created_date', direction: 'desc' });

    useEffect(() => {
        loadLeads();
    }, []);

    const loadLeads = async () => {
        setIsLoading(true);
        try {
            const allLeads = await Lead.list("-created_date", 1000); // Fetch a good number of leads
            setLeads(allLeads);
        } catch (error) {
            console.error("Failed to load leads:", error);
        }
        setIsLoading(false);
    };

    const handleDelete = async (leadId) => {
        try {
            await Lead.delete(leadId);
            setLeads(leads.filter(lead => lead.id !== leadId));
        } catch (error) {
            console.error("Failed to delete lead:", error);
        }
    };
    
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedAndFilteredLeads = useMemo(() => {
        let sortableItems = [...leads];

        if (searchTerm) {
            sortableItems = sortableItems.filter(lead =>
                Object.values(lead).some(value =>
                    String(value).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        sortableItems.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return sortableItems;
    }, [leads, searchTerm, sortConfig]);

    const SortableHeader = ({ children, columnKey }) => (
        <TableHead onClick={() => requestSort(columnKey)} className="cursor-pointer hover:bg-lab-gray transition-colors">
            <div className="flex items-center gap-2">
                {children}
                <ArrowUpDown className="w-4 h-4 text-lab-text-light" />
            </div>
        </TableHead>
    );

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
                            <Users className="w-8 h-8"/>
                            All Leads
                        </h1>
                        <p className="text-lab-text-light mt-1">
                            Manage and review your entire lead database. Found {leads.length} leads.
                        </p>
                    </div>
                    <Link to={createPageUrl("ImportLeads")}>
                        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                            <Plus className="w-4 h-4" />
                            Import More Leads
                        </Button>
                    </Link>
                </motion.div>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lab-text-light" />
                    <Input
                        type="text"
                        placeholder="Search leads by name, email, company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 text-base"
                    />
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="border border-lab-border rounded-xl overflow-hidden lab-card"
                >
                     {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            <p className="ml-4 text-lab-text">Loading leads...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-lab-gray">
                                <TableRow>
                                    <SortableHeader columnKey="first_name">Name</SortableHeader>
                                    <SortableHeader columnKey="email">Email</SortableHeader>
                                    <SortableHeader columnKey="company">Company</SortableHeader>
                                    <SortableHeader columnKey="status">Status</SortableHeader>
                                    <SortableHeader columnKey="created_date">Date Added</SortableHeader>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedAndFilteredLeads.length > 0 ? (
                                    sortedAndFilteredLeads.map(lead => (
                                        <TableRow key={lead.id} className="hover:bg-lab-gray/50">
                                            <TableCell className="font-medium text-lab-text">
                                                {lead.first_name} {lead.last_name}
                                            </TableCell>
                                            <TableCell className="text-lab-text-light">{lead.email}</TableCell>
                                            <TableCell className="text-lab-text-light">{lead.company || "-"}</TableCell>
                                            <TableCell>
                                                <Badge className={`${statusConfig[lead.status]?.color} border-0 capitalize`}>
                                                    {lead.status.replace(/_/g, ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-lab-text-light">
                                                {new Date(lead.created_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the lead for {lead.first_name} {lead.last_name}.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(lead.id)} className="bg-red-600 hover:bg-red-700">
                                                                Delete Lead
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan="6" className="text-center h-24 text-lab-text-light">
                                            No leads found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
