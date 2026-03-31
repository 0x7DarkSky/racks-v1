import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const activities = [
  "Someone just earned $12 💸",
  "New sale detected 🔥",
  "Creator made $8.50 right now",
  "$24 earned in the last hour",
  "A creator just posted & earned $15",
  "New link generated 🚀",
  "$6.99 commission just hit",
];

export default function LiveActivity() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % activities.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden h-8 flex items-center">
      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-glow mr-3 flex-shrink-0" />
      <AnimatePresence mode="wait">
        <motion.span
          key={current}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-muted-foreground font-medium"
        >
          {activities[current]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}