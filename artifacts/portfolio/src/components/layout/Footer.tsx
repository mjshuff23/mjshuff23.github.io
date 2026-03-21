import { Terminal, Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-card border-t border-border py-12 mt-20 relative overflow-hidden">
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg tracking-widest uppercase">
              MICHAEL SHUFF
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="https://github.com/mjshuff23" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Github className="w-5 h-5" />
              <span className="sr-only">GitHub</span>
            </a>
            <a href="mailto:mjshuff23@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
              <Mail className="w-5 h-5" />
              <span className="sr-only">Email</span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Linkedin className="w-5 h-5" />
              <span className="sr-only">LinkedIn</span>
            </a>
          </div>
          
        </div>
        
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground font-mono">
            &copy; {currentYear} Michael Shuff. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60 font-mono">
            Deterministic Integrity &bull; AI Safeguards
          </p>
        </div>
      </div>
    </footer>
  );
}
