import React, { useState, useRef } from "react";
import { Lead } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download,
  ArrowLeft
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import FileUploadZone from "../components/import/FileUploadZone";
import LeadPreview from "../components/import/LeadPreview";
import ColumnMapper from "../components/import/ColumnMapper";

export default function ImportLeads() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [fileHeaders, setFileHeaders] = useState([]);
  const [showMapping, setShowMapping] = useState(false);
  const [extractedLeads, setExtractedLeads] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setRawData([]);
    setFileHeaders([]);
    setShowMapping(false);
    setExtractedLeads([]);
    setError(null);
    setSuccess(false);
    
    await processFile(selectedFile);
  };

  const parseCSV = (csvText) => {
    // More robust line splitting for Windows, Mac, and Linux
    const lines = csvText.trim().split(/\r\n?|\n/);
    if (lines.length === 0 || lines[0].trim() === '') {
      return { headers: [], data: [] };
    }

    // Use a simple split for the header, as headers shouldn't contain commas.
    const headers = lines[0].split(',').map(header => 
      header.trim().replace(/^["']|["']$/g, '')
    );

    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') continue;

      // Use a regex to split the row, which handles commas inside quoted fields.
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          // Clean up each value: trim, remove surrounding quotes, and un-escape double-quotes ("").
          const value = (values[index] || '').trim();
          let cleanedValue = value;
          if (cleanedValue.startsWith('"') && cleanedValue.endsWith('"')) {
            cleanedValue = cleanedValue.substring(1, cleanedValue.length - 1);
          }
          cleanedValue = cleanedValue.replace(/""/g, '"');
          row[header] = cleanedValue;
        });
        data.push(row);
      } else {
        console.warn(`[ImportLeads] Skipping row ${i+1} due to column count mismatch. Expected ${headers.length}, got ${values.length}. Row content: ${line}`);
      }
    }

    return { headers, data };
  };

  const processFile = async (file) => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      setProgress(25);
      
      // Read the file directly in the browser
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });

      setProgress(50);
      
      console.log('[ImportLeads] Raw CSV text length:', text.length);
      console.log('[ImportLeads] First 200 characters:', text.substring(0, 200));

      // Parse CSV
      const { headers, data } = parseCSV(text);
      
      setProgress(75);
      
      console.log('[ImportLeads] Parsed headers:', headers);
      console.log('[ImportLeads] Parsed data rows:', data.length);
      console.log('[ImportLeads] First data row:', data[0]);

      if (headers.length === 0) {
        throw new Error("No column headers found in the CSV file. Please ensure your CSV file has a header row.");
      }

      if (data.length === 0) {
        throw new Error("No data rows found in the CSV file.");
      }
      
      setFileHeaders(headers);
      setRawData(data);
      setShowMapping(true);
      setProgress(100);

    } catch (error) {
      console.error("Error in processFile:", error);
      setError(`Error processing file: ${error.message || "An unknown error occurred."}`);
    }

    setIsProcessing(false);
  };

  const handleMappingComplete = (mapping) => {
    setShowMapping(false);
    setError(null);

    console.log('[ImportLeads] Processing with mapping:', mapping);

    let skippedRows = 0;
    const cleanedData = rawData.map((item, index) => {
      if (!item || typeof item !== 'object') {
        skippedRows++;
        return null;
      }

      // Get mapped values
      const email = item[mapping.email] ? String(item[mapping.email]).trim() : '';
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

      if (!email || !emailRegex.test(email)) {
        console.log(`[ImportLeads] Row ${index + 1} skipped - invalid email:`, email);
        skippedRows++;
        return null;
      }
      
      const first_name = item[mapping.first_name] ? String(item[mapping.first_name]).trim() : '';
      if (!first_name) {
        console.log(`[ImportLeads] Row ${index + 1} skipped - missing first name`);
        skippedRows++;
        return null;
      }

      // Build the lead object
      const lead = {
        email,
        first_name,
        last_name: item[mapping.last_name] ? String(item[mapping.last_name]).trim() : '',
        company: item[mapping.company] ? String(item[mapping.company]).trim() : '',
        title: item[mapping.title] ? String(item[mapping.title]).trim() : '',
        industry: item[mapping.industry] ? String(item[mapping.industry]).trim() : '',
        company_size: item[mapping.company_size] ? String(item[mapping.company_size]).trim() : '',
        notes: item[mapping.notes] ? String(item[mapping.notes]).trim() : '',
        status: 'new',
      };

      return lead;
    }).filter(Boolean);

    console.log(`[ImportLeads] Processed ${cleanedData.length} valid leads, skipped ${skippedRows} rows`);
    
    if (cleanedData.length === 0) {
      setError("No valid leads found after processing. Please check your data and mapping.");
      return;
    }

    setExtractedLeads(cleanedData);
  };

  const handleImport = async () => {
    setIsImporting(true);
    setProgress(0);

    try {
      const batchSize = 10;
      const totalBatches = Math.ceil(extractedLeads.length / batchSize);

      for (let i = 0; i < totalBatches; i++) {
        const startIndex = i * batchSize;
        const endIndex = Math.min(startIndex + batchSize, extractedLeads.length);
        const batch = extractedLeads.slice(startIndex, endIndex);

        await Lead.bulkCreate(batch);
        
        const progressPercent = ((i + 1) / totalBatches) * 100;
        setProgress(progressPercent);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(createPageUrl("AllLeads"));
      }, 2000);

    } catch (error) {
      console.error("Error during import:", error);
      setError(`Import failed: ${error.message}`);
    }

    setIsImporting(false);
  };

  const generateSampleCSV = () => {
    const sampleData = `first_name,last_name,email,company,title
John,Doe,john.doe@example.com,Tech Corp,CEO
Jane,Smith,jane.smith@startup.io,Startup Inc,CTO
Bob,Johnson,bob@consulting.com,Bob's Consulting,Consultant`;
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_leads.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setFile(null);
    setRawData([]);
    setFileHeaders([]);
    setShowMapping(false);
    setExtractedLeads([]);
    setError(null);
    setSuccess(false);
    setProgress(0);
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-lab-text flex items-center gap-3">
              <Upload className="w-8 h-8" />
              Import Leads
            </h1>
            <p className="text-lab-text-light mt-1">
              Upload your CSV file to import leads into your database
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={generateSampleCSV} className="gap-2">
              <Download className="w-4 h-4" />
              Download Sample CSV
            </Button>
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetImport}
                  className="ml-4"
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Successfully imported {extractedLeads.length} leads! Redirecting to All Leads page...
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="lab-card lab-shadow">
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-lab-text mb-2">Processing your file...</h3>
                <p className="text-lab-text-light mb-4">Reading and parsing CSV data</p>
                <Progress value={progress} className="w-full max-w-md mx-auto" />
                <p className="text-sm text-lab-text-light mt-2">{Math.round(progress)}% complete</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!file && !isProcessing && !showMapping && extractedLeads.length === 0 && (
          <FileUploadZone onFileSelect={handleFileSelect} />
        )}

        {showMapping && (
          <ColumnMapper
            headers={fileHeaders}
            rawData={rawData}
            onConfirm={handleMappingComplete}
            onCancel={resetImport}
          />
        )}

        {extractedLeads.length > 0 && !showMapping && (
          <LeadPreview
            leads={extractedLeads}
            onImport={handleImport}
            onCancel={resetImport}
            isImporting={isImporting}
            progress={progress}
          />
        )}
      </div>
    </div>
  );
}