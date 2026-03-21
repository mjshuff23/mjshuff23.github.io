import { motion } from "framer-motion";
import { Terminal, Home } from "lucide-react";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-12 rounded-2xl max-w-md w-full text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-destructive" />
        
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <Terminal className="w-10 h-10" />
          </div>
        </div>
        
        <h1 className="text-6xl font-display font-bold text-foreground mb-2">404</h1>
        <h2 className="text-xl font-mono text-muted-foreground uppercase tracking-widest mb-6">
          System Error
        </h2>
        
        <p className="text-muted-foreground mb-8">
          The requested trajectory leads to an undefined sector. Return to base coordinates.
        </p>
        
        <PremiumButton 
          variant="outline" 
          onClick={() => setLocation("/")}
          className="w-full gap-2 border-foreground/20 text-foreground hover:bg-foreground hover:text-background"
        >
          <Home className="w-4 h-4" />
          Return Home
        </PremiumButton>
      </motion.div>
    </div>
  );
}
