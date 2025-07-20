import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, X, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const REQUIRED_FIELDS = [
  { id: 'email', label: 'Email Address', required: true },
  { id: 'first_name', label: 'First Name', required: true },
];

const OPTIONAL_FIELDS = [
  { id: 'last_name', label: 'Last Name' },
  { id: 'company', label: 'Company Name' },
  { id: 'title', label: 'Job Title' },
  { id: 'industry', label: 'Industry' },
  { id: 'company_size', label: 'Company Size' },
  { id: 'notes', label: 'Notes' },
];

const ALL_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];

export default function ColumnMapper({ headers, onConfirm, onCancel, rawData }) {
  const [mapping, setMapping] = useState({});
  const [errors, setErrors] = useState([]);

  // Debug logging
  console.log("[ColumnMapper] Received headers:", headers);
  console.log("[ColumnMapper] Received rawData sample:", rawData?.slice(0, 2));

  useEffect(() => {
    console.log("[ColumnMapper] Headers in useEffect:", headers);
    
    if (!headers || headers.length === 0) {
      console.warn("[ColumnMapper] No headers received!");
      return;
    }

    // Auto-map based on simple string matching
    const newMapping = {};
    
    headers.forEach(header => {
      const lowerHeader = String(header).toLowerCase();
      console.log("[ColumnMapper] Processing header:", header, "->", lowerHeader);
      
      if (lowerHeader.includes('email') || lowerHeader.includes('e-mail')) {
        newMapping.email = header;
        console.log("[ColumnMapper] Auto-mapped email to:", header);
      } else if (lowerHeader.includes('first') && lowerHeader.includes('name')) {
        newMapping.first_name = header;
        console.log("[ColumnMapper] Auto-mapped first_name to:", header);
      } else if (lowerHeader.includes('last') && lowerHeader.includes('name')) {
        newMapping.last_name = header;
      } else if (lowerHeader.includes('company') || lowerHeader.includes('organization')) {
        newMapping.company = header;
      } else if (lowerHeader.includes('title') || lowerHeader.includes('position')) {
        newMapping.title = header;
      } else if (lowerHeader.includes('industry')) {
        newMapping.industry = header;
      } else if (lowerHeader.includes('size')) {
        newMapping.company_size = header;
      } else if (lowerHeader.includes('note')) {
        newMapping.notes = header;
      }
    });
    
    console.log("[ColumnMapper] Final auto-mapping:", newMapping);
    setMapping(newMapping);
  }, [headers]);

  const handleMappingChange = (fieldId, selectedHeader) => {
    console.log(`[ColumnMapper] Mapping change: ${fieldId} -> ${selectedHeader}`);
    
    setMapping(prev => {
      const updated = { ...prev };
      if (selectedHeader === "ignore" || selectedHeader === "") {
        delete updated[fieldId];
      } else {
        updated[fieldId] = selectedHeader;
      }
      console.log("[ColumnMapper] Updated mapping:", updated);
      return updated;
    });
    setErrors([]);
  };

  const handleConfirm = () => {
    console.log("[ColumnMapper] Confirming with mapping:", mapping);
    
    const newErrors = [];
    
    if (!mapping.email) {
      newErrors.push("Email Address field must be mapped");
    }
    if (!mapping.first_name) {
      newErrors.push("First Name field must be mapped");
    }
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
      console.log("[ColumnMapper] Validation errors:", newErrors);
      return;
    }
    
    onConfirm(mapping);
  };

  // Safety check
  if (!headers || headers.length === 0) {
    return (
      <Card className="lab-card lab-shadow">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">No Column Headers Found</h3>
          <p className="text-red-600 mb-4">
            The file could not be processed properly. No column headers were detected.
          </p>
          <Button onClick={onCancel} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="lab-card lab-shadow">
        <CardHeader>
          <CardTitle>Map Your Columns</CardTitle>
          <p className="text-lab-text-light">
            Found {headers.length} columns in your file. Match them to the required fields below.
            Email Address and First Name are required.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-800">Required fields missing:</span>
              </div>
              <ul className="text-sm text-red-700 list-disc list-inside">
                {errors.map((error, i) => <li key={i}>{error}</li>)}
              </ul>
            </div>
          )}

          {/* Debug info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Available columns:</strong> {headers.join(', ')}
            </p>
          </div>

          <div className="space-y-4">
            {ALL_FIELDS.map(field => (
              <div key={field.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-lab-text">
                      {field.label}
                    </span>
                    {field.required && (
                      <span className="text-red-500 text-sm">*</span>
                    )}
                    {mapping[field.id] && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  {mapping[field.id] && (
                    <p className="text-sm text-lab-text-light mt-1">
                      Mapped to: <strong>{mapping[field.id]}</strong>
                    </p>
                  )}
                </div>
                
                <div className="w-64">
                  <select
                    key={`${field.id}-${headers.length}`}
                    value={mapping[field.id] || ""}
                    onChange={(e) => {
                      console.log(`[ColumnMapper] Select change for ${field.id}:`, e.target.value);
                      handleMappingChange(field.id, e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Choose column...</option>
                    <option value="ignore">— Don't import this field —</option>
                    {headers.map((header, index) => (
                      <option key={`${header}-${index}`} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {rawData && rawData.length > 0 && (
            <div>
              <h4 className="font-medium text-lab-text mb-3">Preview of Your Data</h4>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.slice(0, 6).map((header, index) => (
                        <TableHead key={`header-${index}`} className="text-xs">
                          {header}
                        </TableHead>
                      ))}
                      {headers.length > 6 && <TableHead className="text-xs">...</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rawData.slice(0, 3).map((row, rowIndex) => (
                      <TableRow key={`row-${rowIndex}`}>
                        {headers.slice(0, 6).map((header, cellIndex) => (
                          <TableCell key={`cell-${rowIndex}-${cellIndex}`} className="text-xs max-w-[120px] truncate">
                            {String(row[header] || '').slice(0, 30)}
                          </TableCell>
                        ))}
                        {headers.length > 6 && <TableCell className="text-xs">...</TableCell>}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel} className="gap-2">
            <X className="w-4 h-4" />
            Cancel Import
          </Button>
          <Button 
            onClick={handleConfirm} 
            className="bg-blue-600 hover:bg-blue-700 gap-2"
            disabled={!mapping.email || !mapping.first_name}
          >
            <ArrowRight className="w-4 h-4" />
            Continue with Mapping ({Object.keys(mapping).length} mapped)
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}