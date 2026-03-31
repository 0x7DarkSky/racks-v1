import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PartyPopper, TrendingUp, Eye } from "lucide-react";
import GradientButton from "../components/racks/GradientButton";
import LiveActivity from "../components/racks/LiveActivity";

export default function PostConfirmation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
          className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary to-yellow-300 flex items-center justify-center shadow-lg shadow-secondary/30"
        >
          <PartyPopper className="w-10 h-10 text-black" />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="font-space font-bold text-3xl text-foreground mb-2">
            🔥 Nice, you're live
          </h1>
          <p className="text-muted-foreground text-lg">
            💸 First sales usually come in <span className="text-secondary font-semibold">24–72h</span>
          </p>
        </motion.div>

        {/* Status cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-foreground font-medium text-sm">We are tracking your link</p>
              <p className="text-muted-foreground text-xs">Clicks and sales will show up automatically</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-left">
              <p className="text-foreground font-medium text-sm">Keep posting for more sales</p>
              <p className="text-muted-foreground text-xs">The more content, the more you earn</p>
            </div>
          </div>
        </motion.div>

        {/* Live activity */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center"
        >
          <LiveActivity />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <GradientButton
            variant="secondary"
            onClick={() => navigate("/products")}
            className="w-full text-center"
          >
            👉 Back to products
          </GradientButton>
        </motion.div>
      </div>
    </div>
  );
}