import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun, Terminal, ChevronDown } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Contact", href: "#contact" },
];

const projectLinks = [
  { name: "ESCO", href: "#esco" },
  { name: "Static Chaos", href: "#static-chaos-project" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const isStaticChaosPage = location === "/staticchaos";
  const resolvedNavLinks = navLinks.map((link) => ({
    ...link,
    href: isStaticChaosPage ? `/${link.href}` : link.href,
  }));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "py-3 glass-panel border-b border-white/5 shadow-lg" 
          : "py-5 bg-transparent border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/">
          <a
            className="group flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            data-testid="link-home"
          >
            <Terminal className="w-6 h-6 text-primary group-hover:animate-pulse" />
            <span className="font-display font-bold text-xl tracking-wider uppercase">
              M.SHUFF<span className="text-primary animate-pulse">_</span>
            </span>
          </a>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {resolvedNavLinks.map((link) => {
            if (link.name === "Projects") {
              const resolvedProjectLinks = projectLinks.map((projectLink) => ({
                ...projectLink,
                href: isStaticChaosPage ? `/${projectLink.href}` : projectLink.href,
              }));

              return (
                <div key={link.name} className="group relative">
                  <a
                    href={link.href}
                    className="inline-flex items-center gap-1 text-sm font-display font-medium uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors relative"
                  >
                    {link.name}
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                  </a>

                  <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-3 w-56 -translate-x-1/2 rounded-xl border border-white/10 bg-card/95 p-2 opacity-0 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                    {resolvedProjectLinks.map((projectLink) => (
                      <a
                        key={projectLink.name}
                        href={projectLink.href}
                        className="block rounded-lg px-3 py-2 font-display text-sm uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        {projectLink.name}
                      </a>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-display font-medium uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            );
          })}
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            data-testid="button-theme-toggle"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-muted-foreground hover:text-primary"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-foreground"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-b border-white/10"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {resolvedNavLinks.map((link) => {
                if (link.name === "Projects") {
                  const resolvedProjectLinks = projectLinks.map((projectLink) => ({
                    ...projectLink,
                    href: isStaticChaosPage ? `/${projectLink.href}` : projectLink.href,
                  }));

                  return (
                    <div key={link.name} className="space-y-2 px-4 py-2">
                      <a
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-base font-display font-medium uppercase tracking-widest text-foreground hover:text-primary transition-colors"
                      >
                        {link.name}
                      </a>
                      <div className="space-y-1 border-l border-primary/20 pl-4">
                        {resolvedProjectLinks.map((projectLink) => (
                          <a
                            key={projectLink.name}
                            href={projectLink.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block rounded-md px-2 py-2 font-display text-sm uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                          >
                            {projectLink.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-display font-medium uppercase tracking-widest text-foreground hover:text-primary px-4 py-2 rounded-md hover:bg-primary/10 transition-colors"
                  >
                    {link.name}
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
