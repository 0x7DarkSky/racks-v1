import { cn } from "@/lib/utils";

export default function GradientButton({ children, onClick, className, variant = "primary", size = "lg", disabled = false }) {
  const base = "font-space font-bold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-blue-400 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40",
    secondary: "bg-gradient-to-r from-secondary to-yellow-300 text-black shadow-lg shadow-secondary/25 hover:shadow-secondary/40",
    ghost: "bg-muted text-foreground hover:bg-muted/80",
  };

  const sizes = {
    lg: "px-8 py-4 text-lg",
    md: "px-6 py-3 text-base",
    sm: "px-4 py-2 text-sm",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {children}
    </button>
  );
}