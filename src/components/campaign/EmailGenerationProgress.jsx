import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Zap, Mail } from "lucide-react";

export default function EmailGenerationProgress({ progress }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <Card className="lab-card lab-shadow">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <Mail className="w-6 h-6 text-blue-600 animate-bounce" />
          </div>
          
          <h3 className="text-lg font-semibold text-lab-text mb-2">
            Generating AI-Powered Emails...
          </h3>
          <p className="text-lab-text-light mb-4">
            Creating personalized outreach emails for your leads
          </p>
          
          <Progress value={progress} className="w-full max-w-md mx-auto mb-2" />
          <p className="text-sm text-lab-text-light">
            {Math.round(progress)}% complete
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}