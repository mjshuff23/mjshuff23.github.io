import { motion } from "framer-motion";
import { FileText, ArrowRight } from "lucide-react";
import { PremiumButton } from "@/components/ui/PremiumButton";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden" id="home">
      
      {/* Background Graphic Element */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt=""
          className="w-full h-full object-cover mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="max-w-3xl">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-[1px] w-12 bg-primary" />
            <span className="text-primary font-mono text-sm tracking-[0.2em] uppercase font-semibold text-glow">
              System Initialization Complete
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-8xl font-display font-bold text-foreground leading-[1.1] mb-6"
          >
            MICHAEL <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">SHUFF</span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground font-light mb-4 border-l-2 border-primary/50 pl-4"
          >
            Staff Systems Architect <br className="md:hidden" />
            <span className="hidden md:inline"> | </span> 
            AI Safeguards & Adversarial Researcher
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-base md:text-lg text-muted-foreground/80 mb-10 max-w-2xl leading-relaxed"
          >
            Building transparent, auditable AI systems with deterministic integrity. Engineering neuro-symbolic circuit breakers to mitigate deceptive model behaviors.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a href="#projects">
              <PremiumButton className="w-full sm:w-auto gap-2">
                View Architecture <ArrowRight className="w-4 h-4" />
              </PremiumButton>
            </a>
            
            <a href="https://docs.google.com/document/d/1B2KtRocWTPhkZwgTxw69VK_FLKXmvhOeXGxCmQ_V76Y" target="_blank" rel="noreferrer">
              <PremiumButton variant="outline" className="w-full sm:w-auto gap-2 bg-background/50 backdrop-blur-sm">
                <FileText className="w-4 h-4" />
                Audit Resume
              </PremiumButton>
            </a>
          </motion.div>

        </div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent" />
      </motion.div>
    </section>
  );
}
