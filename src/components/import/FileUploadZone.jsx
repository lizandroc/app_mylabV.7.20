import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Upload, FileText, AlertCircle } from "lucide-react";

export default function FileUploadZone({ onFileSelect }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    // Only accept CSV files
    const isValidType = file.type === "text/csv";
    const isValidExtension = file.name.toLowerCase().endsWith(".csv");

    if (!isValidType && !isValidExtension) {
      alert("Please upload a CSV file (.csv) only. Excel files (.xls, .xlsx) are not supported.");
      return;
    }
    
    onFileSelect(file);
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
        dragActive 
          ? "border-blue-400 bg-blue-50" 
          : "border-lab-border hover:border-blue-300"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileInput}
        className="hidden"
      />

      <div className="text-center">
        <motion.div
          animate={{ scale: dragActive ? 1.1 : 1 }}
          className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center"
        >
          <Upload className="w-8 h-8 text-blue-600" />
        </motion.div>

        <h3 className="text-xl font-semibold text-lab-text mb-2">
          {dragActive ? "Drop your file here" : "Upload Lead Database"}
        </h3>
        
        <p className="text-lab-text-light mb-6">
          Drag and drop your CSV file, or click to browse
        </p>

        <Button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <FileText className="w-4 h-4 mr-2" />
          Choose File
        </Button>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="font-medium text-blue-900">CSV File Support:</p>
              <ul className="text-sm text-blue-800 mt-1 space-y-1">
                <li>• Only CSV files are supported</li>
                <li>• Flexible column names (e.g., "Name", "Full Name", "First Name")</li>
                <li>• Email variations supported (e.g., "Email", "E-mail", "Email Address")</li>
                <li>• Company names can be "Company", "Organization", etc.</li>
                <li>• Only name and email are required fields</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}