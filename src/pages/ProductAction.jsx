import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Share2, Check, ArrowLeft, Link2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import GradientButton from "../components/racks/GradientButton";
import { products } from "../data/products";

export default function ProductAction() {
  const { productId } = useParams();
  console.log("productId from URL:", productId);
  console.log("all products:", products);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const product = useMemo(() => {
    return products.find((p) => p.id === productId);
  }, [productId]);

  const affiliateLink = useMemo(() => {
  if (!product) return null;
  return {
    id: `link-${product.id}`,
    product_id: product.id,
    posted: false,
    link: product.affiliate_url,
  };
}, [product]);

  const earnPerSale = product
    ? ((product.price * product.commission_percentage) / 100).toFixed(2)
    : "0";

  const handleCopy = async () => {
    if (!affiliateLink) return;
    await navigator.clipboard.writeText(affiliateLink.link);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!affiliateLink) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${product?.name}`,
          text: `Get ${product?.name} here!`,
          url: affiliateLink.link,
        });
      } catch (error) {
        console.error("Share cancelled or failed:", error);
      }
    } else {
      handleCopy();
    }
  };

  const handlePosted = () => {
    const postedLinks = JSON.parse(localStorage.getItem("postedLinks") || "[]");

    const alreadyExists = postedLinks.some((item) => item.product_id === product.id);

    if (!alreadyExists) {
      postedLinks.push({
        id: affiliateLink.id,
        product_id: product.id,
        product_name: product.name,
        link: affiliateLink.link,
        posted: true,
        clicks: 0,
        sales: 0,
        earnings: 0,
      });

      localStorage.setItem("postedLinks", JSON.stringify(postedLinks));
    }

    navigate("/posted");
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">Product not found</p>
          <GradientButton
            variant="ghost"
            size="md"
            onClick={() => navigate("/products")}
            className="mt-4"
          >
            Back to products
          </GradientButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pt-4 pb-24">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-5 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden flex-shrink-0">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              )}
            </div>
            <div>
              <h2 className="font-space font-bold text-foreground text-lg">
                {product.name}
              </h2>
              <p className="text-muted-foreground text-sm">
                ${product.price.toFixed(2)} · {product.commission_percentage}% commission
              </p>
            </div>
          </div>

          <div className="mt-4 bg-gradient-to-r from-secondary/10 to-yellow-300/10 border border-secondary/20 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">You earn per sale</p>
            <p className="font-space font-bold text-3xl bg-gradient-to-r from-secondary to-yellow-300 bg-clip-text text-transparent">
              ${earnPerSale}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-2xl p-5 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-4 h-4 text-primary" />
            <h3 className="font-space font-semibold text-foreground">Your affiliate link</h3>
          </div>

          <div className="bg-muted rounded-xl p-3 mb-4 break-all">
            <p className="text-sm text-foreground/80 font-mono">
              {affiliateLink?.link || "Generating..."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 rounded-xl py-3 text-sm font-medium text-foreground transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy link"}
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 rounded-xl py-3 text-sm font-medium text-foreground transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-5 mb-8"
        >
          <h3 className="font-space font-semibold text-foreground mb-4">
            How to start earning
          </h3>

          <div className="space-y-4">
            {[
              { n: "1", text: "Post a TikTok or Reel about this product" },
              { n: "2", text: "Put this link in your bio" },
              { n: "3", text: "Start earning when people buy" },
            ].map((step) => (
              <div key={step.n} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-space font-bold text-sm">
                    {step.n}
                  </span>
                </div>
                <p className="text-foreground/80 text-sm pt-0.5">{step.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <GradientButton
          variant="primary"
          onClick={handlePosted}
          className="w-full text-center"
        >
          👉 I posted my video
        </GradientButton>
      </div>
    </div>
  );
}