import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import GradientButton from "./GradientButton";

const tagStyles = {
  Trending: {
    emoji: "🔥",
    bg: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  },
  "Easy to sell": {
    emoji: "⚡",
    bg: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  },
  "High commission": {
    emoji: "💸",
    bg: "bg-green-500/15 text-green-400 border-green-500/20",
  },
  New: {
    emoji: "✨",
    bg: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  },
  Popular: {
    emoji: "⭐",
    bg: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  },
};

export default function ProductCard({ product, onGetLink, index = 0 }) {
  const [imageError, setImageError] = useState(false);
  const [imageFit, setImageFit] = useState("cover");

  const earnPerSale = (
    (product.price * product.commission_percentage) / 100
  ).toFixed(2);

  function handleImageLoad(event) {
    const img = event.currentTarget;
    const width = img.naturalWidth || 1;
    const height = img.naturalHeight || 1;
    const ratio = width / height;

    if (ratio > 1.2 || ratio < 0.85) {
      setImageFit("contain");
    } else {
      setImageFit("cover");
    }
  }

  const imageClass =
    imageFit === "contain"
      ? "w-full h-full object-contain object-center transition-transform duration-300 hover:scale-[1.01]"
      : "w-full h-full object-cover object-center transition-transform duration-300 hover:scale-[1.03]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
    >
      <div className="relative aspect-square bg-[#111318] overflow-hidden">
        {product.image_url && !imageError ? (
          <div className="w-full h-full p-3">
            <div className="w-full h-full bg-white rounded-xl overflow-hidden flex items-center justify-center">
              <img
                src={product.image_url}
                alt={product.name}
                loading="lazy"
                onLoad={handleImageLoad}
                onError={() => setImageError(true)}
                className={imageClass}
                style={{ objectPosition: "center center" }}
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        <div className="absolute bottom-3 right-3 bg-gradient-to-r from-secondary to-yellow-300 text-black font-space font-bold px-3 py-1.5 rounded-lg text-sm shadow-lg">
          💰 Earn ${earnPerSale}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-space font-bold text-foreground text-lg leading-tight min-h-[3.5rem] line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-muted-foreground text-sm">
              ${product.price.toFixed(2)}
            </span>

            <span className="text-primary font-semibold text-sm">
              {product.commission_percentage}% commission
            </span>
          </div>
        </div>

        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.tags.map((tag) => {
              const style = tagStyles[tag] || tagStyles.Popular;

              return (
                <span
                  key={tag}
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${style.bg}`}
                >
                  {style.emoji} {tag}
                </span>
              );
            })}
          </div>
        )}

        <div className="pt-1">
          <GradientButton
            variant="secondary"
            size="md"
            onClick={() => onGetLink(product)}
            className="w-full"
          >
            👉 Get my link
          </GradientButton>
        </div>
      </div>
    </motion.div>
  );
}