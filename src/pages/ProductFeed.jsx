import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { products } from "../data/products";
import { Search, Zap } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "../components/racks/ProductCard";
import LiveActivity from "../components/racks/LiveActivity";

const categories = ["All", "Fashion", "Tech", "Beauty", "Fitness", "Home", "Food", "Digital"];

export default function ProductFeed() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const isLoading = false;

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "All" || p.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const handleGetLink = (product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-space font-bold text-lg text-foreground">Racks</span>
        </div>
      </div>

      {/* Live activity */}
      <div className="mb-4">
        <LiveActivity />
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-primary text-white"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <p className="text-muted-foreground text-lg mb-2">No products found</p>
          <p className="text-muted-foreground/70 text-sm">Try a different search or category</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              onGetLink={handleGetLink}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}