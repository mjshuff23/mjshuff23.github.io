import { motion } from "framer-motion";
import { SectionHeading } from "./SectionHeading";
import { Mail, SquareCode, Linkedin, Phone, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { PERSONAL } from "@/data/resume";

const githubHandle = PERSONAL.github.replace("https://github.com/", "");
const phoneFormatted = PERSONAL.phone;
const phoneDigits = PERSONAL.phone.replace(/\D/g, "");

export function Contact() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section className="py-24 relative overflow-hidden" id="contact">
      {/* Decorative gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-full max-h-lg bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p className="text-primary font-mono text-sm tracking-[0.2em] uppercase mb-4">05. End of Line</p>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-foreground uppercase mb-6">
            Initiate Contact
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Open to roles focused on AI safety, adversarial research, and systems architecture.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6 rounded-xl flex flex-col items-center gap-4 hover:border-primary/50 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="font-display font-semibold text-foreground uppercase mb-1">Email</p>
              <a href={`mailto:${PERSONAL.email}`} className="text-sm text-muted-foreground hover:text-primary transition-colors font-mono">
                {PERSONAL.email}
              </a>
            </div>
            <button 
              onClick={() => handleCopy(PERSONAL.email, "email")}
              className="mt-2 p-2 rounded-md hover:bg-secondary text-muted-foreground transition-colors"
              title="Copy Email"
            >
              {copied === "email" ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6 rounded-xl flex flex-col items-center gap-4 hover:border-primary/50 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <SquareCode className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="font-display font-semibold text-foreground uppercase mb-1">GitHub</p>
              <a href={PERSONAL.github} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors font-mono">
                github.com/{githubHandle}
              </a>
            </div>
            <a 
              href={PERSONAL.github}
              target="_blank" 
              rel="noreferrer"
              className="mt-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-xs font-mono hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Visit Profile
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-6 rounded-xl flex flex-col items-center gap-4 hover:border-primary/50 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Linkedin className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="font-display font-semibold text-foreground uppercase mb-1">LinkedIn</p>
              <a href={PERSONAL.linkedin} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors font-mono">
                linkedin.com/in/michael-shuff
              </a>
            </div>
            <a
              href={PERSONAL.linkedin}
              target="_blank"
              rel="noreferrer"
              className="mt-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-xs font-mono hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Visit Profile
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-6 rounded-xl flex flex-col items-center gap-4 hover:border-primary/50 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="font-display font-semibold text-foreground uppercase mb-1">Phone</p>
              <a href={`tel:${phoneDigits}`} className="text-sm text-muted-foreground hover:text-primary transition-colors font-mono">
                {phoneFormatted}
              </a>
            </div>
            <button 
              onClick={() => handleCopy(phoneDigits, "phone")}
              className="mt-2 p-2 rounded-md hover:bg-secondary text-muted-foreground transition-colors"
              title="Copy Phone"
            >
              {copied === "phone" ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
