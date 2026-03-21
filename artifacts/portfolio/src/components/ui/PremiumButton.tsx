import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center font-display uppercase tracking-widest font-semibold transition-all duration-300 ease-out rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)]",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-2 border-transparent",
      outline: "bg-transparent text-primary border-2 border-primary/50 hover:border-primary hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]",
      ghost: "bg-transparent text-foreground hover:text-primary hover:bg-primary/10 border-2 border-transparent"
    };
    
    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base"
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PremiumButton.displayName = "PremiumButton";
