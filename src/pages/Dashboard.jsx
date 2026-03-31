import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { DollarSign, MousePointer, ShoppingCart, Zap } from "lucide-react";

export default function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: links = [], isLoading } = useQuery({
    queryKey: ["myLinks", user?.id],
    queryFn: () => base44.entities.AffiliateLink.filter({ creator_id: user.id }),
    enabled: !!user?.id,
  });

  const totalEarnings = links.reduce((sum, l) => sum + (l.total_earned || 0), 0);
  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
  const totalSales = links.reduce((sum, l) => sum + (l.sales_count || 0), 0);

  const stats = [
    {
      label: "Total Earnings",
      value: `$${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      gradient: "from-secondary to-yellow-300",
      iconColor: "text-black",
    },
    {
      label: "Total Clicks",
      value: totalClicks.toString(),
      icon: MousePointer,
      gradient: "from-primary to-blue-400",
      iconColor: "text-white",
    },
    {
      label: "Total Sales",
      value: totalSales.toString(),
      icon: ShoppingCart,
      gradient: "from-green-500 to-emerald-400",
      iconColor: "text-white",
    },
  ];

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-space font-bold text-lg text-foreground">My Earnings</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stats */}
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                <p className="font-space font-bold text-2xl text-foreground">{stat.value}</p>
              </div>
            </motion.div>
          ))}

          {/* Active Links */}
          {links.length > 0 && (
            <div className="mt-6">
              <h3 className="font-space font-semibold text-foreground mb-3">Your Links</h3>
              <div className="space-y-3">
                {links.map((link, i) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="bg-card border border-border rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-foreground font-medium text-sm">{link.product_name || "Product"}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          {link.clicks || 0} clicks · {link.sales_count || 0} sales
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-space font-bold text-secondary">${(link.total_earned || 0).toFixed(2)}</p>
                        {link.posted && (
                          <span className="text-[10px] bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full">Posted</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {links.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center py-8"
            >
              <p className="text-muted-foreground mb-1">No links yet</p>
              <p className="text-muted-foreground/60 text-sm">Go to Products and get your first link!</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}