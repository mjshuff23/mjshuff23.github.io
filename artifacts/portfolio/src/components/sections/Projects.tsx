import { motion } from "framer-motion";
import { SectionHeading } from "./SectionHeading";
import { ExternalLink, Database, Network, ShieldCheck, FileText } from "lucide-react";

export function Projects() {
  const ecosystem = [
    {
      title: "SocraBot",
      tagline: "Socratic AI for dialectical conversation",
      description: "A real-time monitoring framework with a Fallacy Accumulation Scoring Model to detect sycophancy and reward-hacking. Reinforcement-tuned with logic/fallacy detection.",
      tags: ["Dialectic AI", "Fallacy Detection", "RL"],
      icon: Network,
      link: "https://www.figma.com/board/THRCAnzSeMAOIDTSQA92jJ/SocraBot-Fallacy-Accumulation-Scoring-Model"
    },
    {
      title: "Light Web",
      tagline: "An ethical alternative digital space",
      description: "Ad-free, community-oriented platform with chatrooms and embedded ethical AIs. Multi-agent system with sentiment analysis for moderation.",
      tags: ["Decentralized Web", "Multi-Agent"],
      icon: Database,
    },
    {
      title: "MedBot",
      tagline: "Medical research bias detector",
      description: "Multi-layer NLP pipeline that ingests and grades medical studies for bias and methodological rigor by recursively analyzing citations.",
      tags: ["NLP", "Bias Detection", "Citation Analysis"],
      icon: ShieldCheck,
    },
    {
      title: "BillBot",
      tagline: "Government bill transparency analyzer",
      description: "Analyzes legislation for incoherence, hidden agendas, or contradictions between bill titles and contents using Transformer-based semantic contrastive analysis.",
      tags: ["Legal NLP", "Transparency"],
      icon: FileText,
    },
    {
      title: "ArchiveBot (DeepFile)",
      tagline: "Declassified document intelligence",
      description: "Parses and analyzes FOIA files. Downloads, OCRs, and semantically maps entities across documents, highlighting contradictions.",
      tags: ["Document Intelligence", "FOIA"],
      icon: Database,
    }
  ];

  return (
    <section className="py-24" id="projects">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Research & Development" index="03" subtitle="Ethical AI Ecosystem" />

        {/* Featured Project: ESCO */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 glass-panel rounded-2xl overflow-hidden box-glow border border-primary/20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          
          <div className="p-8 md:p-12 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-primary/20 text-primary font-mono text-xs uppercase tracking-widest rounded-full border border-primary/30">
                    Featured Architecture
                  </span>
                  <span className="text-muted-foreground font-mono text-sm">2024 - Present</span>
                </div>
                <h3 className="text-3xl md:text-5xl font-display font-bold text-foreground uppercase">
                  Project ESCO
                </h3>
                <p className="text-xl text-muted-foreground mt-2 font-light">
                  Ethics, Sovereignty, and Coherence
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-primary font-mono">Founder & Lead Architect</p>
              </div>
            </div>

            <p className="text-lg text-foreground/90 leading-relaxed mb-8 max-w-4xl">
              A transparent, auditable AI safeguard framework. ESCO integrates a neuro-symbolic architecture that decouples the neural core from a deterministic Symbolic Ethics Layer. It maintains coherence and delivers truth in a user-chosen tone.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-4">
                <h4 className="font-display font-semibold text-lg text-primary uppercase border-b border-border pb-2">
                  Sub-Projects & Scope
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span className="text-muted-foreground"><strong className="text-foreground">Neuro-Symbolic Safeguard & Ethics Gate:</strong> Hybrid AI framework with deterministic symbolic constraints.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span className="text-muted-foreground"><strong className="text-foreground">Forensic Probing & Adversarial Research:</strong> Adversarial testing on frontier models (GPT-4o, Claude 3.5) to identify deceptive alignment.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span className="text-muted-foreground"><strong className="text-foreground">Audit & Transparency Layer:</strong> Reasoning Trace Graphs and Immutable Decision Logs for forensic review.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-display font-semibold text-lg text-primary uppercase border-b border-border pb-2">
                  System Blueprints (Figma)
                </h4>
                <div className="flex flex-col gap-3">
                  <a href="https://www.figma.com/board/5mJ6fDzeAvRiH5VqXz6PCT/ESCO-Layered-Architecture-Map" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-md bg-secondary/50 hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all group">
                    <span className="font-mono text-sm text-foreground group-hover:text-primary transition-colors">Layered Architecture Map</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  </a>
                  <a href="https://www.figma.com/board/ytQZnXTlbivQE67RyA4h5m/ESCO-Cross-Domain-Architecture-Network" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-md bg-secondary/50 hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all group">
                    <span className="font-mono text-sm text-foreground group-hover:text-primary transition-colors">Cross-Domain Network</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  </a>
                  <a href="https://www.figma.com/board/N88czdXX6gDNbkP5c01Lq3/ESCO-System-Architecture-Map" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-md bg-secondary/50 hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all group">
                    <span className="font-mono text-sm text-foreground group-hover:text-primary transition-colors">System Architecture Blueprint</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-6 border-t border-border/50">
              {["Neuro-Symbolic AI", "Ethics", "Adversarial Research", "Transparency"].map(tag => (
                <span key={tag} className="px-3 py-1 bg-background text-muted-foreground font-mono text-xs rounded border border-border">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Ecosystem Grid */}
        <h3 className="text-2xl font-display font-semibold text-foreground uppercase mb-8 flex items-center gap-4">
          ESCO Ecosystem
          <div className="h-px flex-grow bg-border" />
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ecosystem.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-card border border-border p-6 rounded-xl hover:border-primary/50 transition-all duration-300 flex flex-col h-full group"
            >
              <div className="flex items-start justify-between mb-4">
                <project.icon className="w-8 h-8 text-primary/50 group-hover:text-primary transition-colors" />
                {project.link && (
                  <a href={project.link} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-primary/10 transition-colors">
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  </a>
                )}
              </div>
              
              <h4 className="text-xl font-display font-bold text-foreground mb-1 group-hover:text-primary transition-colors uppercase">
                {project.title}
              </h4>
              <p className="text-primary/80 font-mono text-xs mb-4 uppercase tracking-wider h-8">
                {project.tagline}
              </p>
              
              <p className="text-sm text-muted-foreground mb-6 flex-grow">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-auto">
                {project.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-secondary text-secondary-foreground font-mono text-[10px] rounded border border-border">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
