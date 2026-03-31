import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import GradientButton from "../components/racks/GradientButton";
import StepBlock from "../components/racks/StepBlock";
import LiveActivity from "../components/racks/LiveActivity";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-lg mx-auto w-full px-5 py-8 flex-1 flex flex-col">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 mb-12"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-space font-bold text-xl text-foreground tracking-tight">Racks</span>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 mb-10"
        >
          <h1 className="font-space font-bold text-4xl leading-tight text-foreground">
            Make your first{" "}
            <span className="bg-gradient-to-r from-secondary to-yellow-300 bg-clip-text text-transparent">
              $10
            </span>{" "}
            with your next video
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Pick a product. Post a video. Earn money.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-3 mb-10">
          <StepBlock number={1} text="Pick a product" delay={0.2} />
          <StepBlock number={2} text="Get your link" delay={0.3} />
          <StepBlock number={3} text="Post a video" delay={0.4} />
          <StepBlock number={4} text="Earn money" delay={0.5} />
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <GradientButton
            variant="secondary"
            onClick={() => navigate("/products")}
            className="w-full text-center"
          >
            👉 Start earning
          </GradientButton>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-auto space-y-3"
        >
          <LiveActivity />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-secondary">💸</span>
            <span>Last sale happened recently</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}