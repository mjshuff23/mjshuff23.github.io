import { motion } from "framer-motion";
import { SectionHeading } from "./SectionHeading";
import { ExternalLink, Database, Network, ShieldCheck, FileText } from "lucide-react";
import { ESCO_PROJECT, ECOSYSTEM_PROJECTS } from "@/data/resume";

const ECOSYSTEM_ICONS = [Network, Database, ShieldCheck, FileText, Database];

export function Projects() {
  const ecosystem = ECOSYSTEM_PROJECTS.map((p, i) => ({
    ...p,
    icon: ECOSYSTEM_ICONS[i] ?? Database,
  }));

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
                  <span className="text-muted-foreground font-mono text-sm">{ESCO_PROJECT.dateRange}</span>
                </div>
                <h3 className="text-3xl md:text-5xl font-display font-bold text-foreground uppercase">
                  {ESCO_PROJECT.title}
                </h3>
                <p className="text-xl text-muted-foreground mt-2 font-light">
                  {ESCO_PROJECT.tagline}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-primary font-mono">{ESCO_PROJECT.role}</p>
              </div>
            </div>

            <p className="text-lg text-foreground/90 leading-relaxed mb-8 max-w-4xl">
              {ESCO_PROJECT.description}
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-4">
                <h4 className="font-display font-semibold text-lg text-primary uppercase border-b border-border pb-2">
                  Sub-Projects & Scope
                </h4>
                <ul className="space-y-3">
                  {ESCO_PROJECT.subProjects.map((sp) => (
                    <li key={sp.title} className="flex items-start gap-2">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">{sp.title}:</strong> {sp.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-display font-semibold text-lg text-primary uppercase border-b border-border pb-2">
                  System Blueprints (Figma)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {ESCO_PROJECT.figmaBoards.map(({ label, img, href }) => (
                    <a key={label} href={href} target="_blank" rel="noreferrer" className="group block rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-200">
                      <div className="relative overflow-hidden bg-secondary/30 aspect-video">
                        <img src={img} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <ExternalLink className="w-5 h-5 text-primary drop-shadow" />
                        </div>
                      </div>
                      <div className="px-2 py-1.5 bg-secondary/30">
                        <span className="font-mono text-[10px] text-muted-foreground group-hover:text-primary transition-colors uppercase tracking-wider">{label}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-6 border-t border-border/50">
              {ESCO_PROJECT.tags.map(tag => (
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
