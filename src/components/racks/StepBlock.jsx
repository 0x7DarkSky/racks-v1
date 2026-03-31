import { motion } from "framer-motion";

export default function StepBlock({ number, text, icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center gap-4 bg-card border border-border rounded-xl p-4"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center font-space font-bold text-white text-lg">
        {number}
      </div>
      <span className="text-foreground font-medium text-base">
        {icon && <span className="mr-2">{icon}</span>}
        {text}
      </span>
    </motion.div>
  );
}