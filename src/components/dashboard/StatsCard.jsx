
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const colorVariants = {
  blue: {
    gradient: "from-blue-500 to-blue-600",
    text: "text-blue-600",
  },
  purple: {
    gradient: "from-purple-500 to-purple-600",
    text: "text-purple-600",
  },
  green: {
    gradient: "from-green-500 to-green-600",
    text: "text-green-600",
  },
  orange: {
    gradient: "from-orange-500 to-orange-600",
    text: "text-orange-600",
  }
};

export default function StatsCard({ title, value, icon: Icon, color, trend }) {
  const selectedColor = colorVariants[color] || colorVariants.blue;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="lab-card lab-shadow relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${selectedColor.gradient} opacity-10 rounded-full transform translate-x-8 -translate-y-8`} />
        
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-lab-text-light">{title}</p>
              <p className="text-3xl font-bold text-lab-text">{value}</p>
              {trend && (
                <p className="text-xs text-lab-text-light bg-lab-gray px-2 py-1 rounded-full inline-block">
                  {trend}
                </p>
              )}
            </div>
            
            <div className={`p-3 rounded-xl bg-gradient-to-br ${selectedColor.gradient} bg-opacity-10`}>
              <Icon className={`w-6 h-6 ${selectedColor.text}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
