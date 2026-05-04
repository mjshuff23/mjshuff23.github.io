import { motion } from "framer-motion";
import { Link } from "wouter";
import { SectionHeading } from "./SectionHeading";
import { ExternalLink, Database, Network, ShieldCheck, FileText, TerminalSquare, ArrowRight, RadioTower, ScanSearch, Smartphone, MessagesSquare } from "lucide-react";
import { ESCO_PROJECT, ECOSYSTEM_PROJECTS } from "@/data/resume";
import { PremiumButton } from "@/components/ui/PremiumButton";

const ECOSYSTEM_ICONS = [Network, Database, ShieldCheck, FileText, Database];
const staticChaosPreview = `${import.meta.env.BASE_URL}images/static-chaos.png`;
const tradingCardAppPreview = `${import.meta.env.BASE_URL}images/trading-card-app.png`;
const tradingCardBinderPreview = `${import.meta.env.BASE_URL}images/trading-card-app-2.png`;

export function Projects() {
  const ecosystem = ECOSYSTEM_PROJECTS.map((p, i) => ({
    ...p,
    icon: ECOSYSTEM_ICONS[i] ?? Database,
  }));

  return (
    <section className="py-24" id="projects">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Research & Development" index="03" subtitle="Systems, Products & Live Experiments" />

        {/* Featured Project: ESCO */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          id="esco"
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          id="trading-card-app-project"
          className="mt-16 rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-8 md:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.95fr] lg:items-stretch">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#15100d] shadow-[0_20px_70px_rgba(0,0,0,0.32)]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <ScanSearch className="h-5 w-5 text-primary" />
                    <span className="font-mono text-xs uppercase tracking-[0.26em] text-primary">
                      Collection Workspace
                    </span>
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    Mobile + Desktop Flow
                  </span>
                </div>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={tradingCardAppPreview}
                    alt="Trading Card App overview screen"
                    className="h-full w-full object-cover object-top transition-transform duration-500 hover:scale-[1.02]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_58%,rgba(21,16,13,0.88)_100%)]" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-background/70 p-4 backdrop-blur-sm">
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                    Current Detection Stack
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    OCR-first identification with a DuckDuckGo reverse image search fallback when text extraction is not enough.
                  </p>
                </div>
                <div className="overflow-hidden rounded-xl border border-white/10 bg-background/70 backdrop-blur-sm">
                  <img
                    src={tradingCardBinderPreview}
                    alt="Trading Card App binder and catalog view"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
                    Product In Progress
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-3xl font-display font-bold uppercase text-foreground md:text-4xl">
                    Trading Card App
                  </h3>
                  <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                    A local-first trading card collection app designed for mobile and desktop. The current MVP centers on card scanning and identification, while the end state is a social binder platform where each set is visualized, duplicates can be listed for trade or sale, and missing cards become a trackable want list.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {["Next.js", "NestJS", "Prisma", "Postgres", "Garage S3", "OCR", "Reverse Image Search"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-border bg-background px-3 py-1 font-mono text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-background/70 p-5 backdrop-blur-sm">
                    <div className="mb-3 flex items-center gap-3 text-sm font-mono uppercase tracking-[0.2em] text-primary">
                      <ScanSearch className="h-4 w-4" />
                      Shipping Now
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Scan cards from phone or desktop, review candidate matches, and manage the binder catalog through a cleaner app workflow.
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-background/70 p-5 backdrop-blur-sm">
                    <div className="mb-3 flex items-center gap-3 text-sm font-mono uppercase tracking-[0.2em] text-primary">
                      <MessagesSquare className="h-4 w-4" />
                      Planned Layer
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Per-set virtual binders, duplicate trading/sales listings, wanted-card states, brand and set chats, DMs, and premium PSA estimate grading.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-background/70 p-5 backdrop-blur-sm">
                  <div className="mb-3 flex items-center gap-3 text-sm font-mono uppercase tracking-[0.2em] text-primary">
                    <Database className="h-4 w-4" />
                    Implementation Stack
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Monorepo architecture with a Next.js frontend, NestJS backend, Prisma data layer, Postgres storage, and Garage as S3-compatible object storage. The backend exposes scan, confirm, catalog, CSV import, health, and Swagger endpoints, with weighted OCR matching and DuckDuckGo reverse lookup to keep the MVP usable without paid cloud dependencies.
                  </p>
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-white/10 bg-background/70 p-5 backdrop-blur-sm">
                <div className="flex items-center gap-3 text-sm font-mono uppercase tracking-[0.2em] text-primary">
                  <RadioTower className="h-4 w-4" />
                  Live Access
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Open the deployed demo to see the scan flow, review surface, and binder management interface in its current state.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <a
                    href="https://frontend-production-447d.up.railway.app/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <PremiumButton className="w-full gap-2">
                      Launch Demo <ArrowRight className="h-4 w-4" />
                    </PremiumButton>
                  </a>
                  <a
                    href="https://github.com/mjshuff23/tradingcardapp"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <PremiumButton variant="outline" className="w-full gap-2">
                      View Source <ExternalLink className="h-4 w-4" />
                    </PremiumButton>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          id="static-chaos-project"
          className="mt-16 rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-8 md:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-stretch">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#071118] shadow-[0_20px_70px_rgba(0,0,0,0.32)]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <TerminalSquare className="h-5 w-5 text-primary" />
                  <span className="font-mono text-xs uppercase tracking-[0.26em] text-primary">
                    Translation Study
                  </span>
                </div>
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Live C to TS Bridge
                </span>
              </div>
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={staticChaosPreview}
                  alt="Static Chaos live terminal preview"
                  className="h-full w-full object-cover object-top transition-transform duration-500 hover:scale-[1.02]"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(7,17,24,0.92)_100%)]" />
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <RadioTower className="h-5 w-5 text-primary" />
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
                    Live Systems Demo
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-3xl font-display font-bold uppercase text-foreground md:text-4xl">
                    Static Chaos
                  </h3>
                  <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                    A legacy C MUD I use to study lower-level abstraction by translating it
                    into TypeScript and browser tooling I already understand. The live page
                    shows the bridge itself: raw TCP underneath, a TypeScript wrapper in the
                    middle, and a recruiter-friendly terminal on top.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {["C", "TypeScript", "Protocol Translation", "Railway", "WebSocket Gateway"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-border bg-background px-3 py-1 font-mono text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-white/10 bg-background/70 p-5 backdrop-blur-sm">
                <div className="flex items-center gap-3 text-sm font-mono uppercase tracking-[0.2em] text-primary">
                  <RadioTower className="h-4 w-4" />
                  Live Access
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Open the dedicated page to inspect the architecture story and use the live
                  terminal running through the Railway gateway.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <Link href="/staticchaos" asChild>
                    <a>
                      <PremiumButton className="w-full gap-2">
                        Launch Demo <ArrowRight className="h-4 w-4" />
                      </PremiumButton>
                    </a>
                  </Link>
                  <a
                    href="https://github.com/mjshuff23/staticchaos"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <PremiumButton variant="outline" className="w-full gap-2">
                      View Source <ExternalLink className="h-4 w-4" />
                    </PremiumButton>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
      </div>
    </section>
  );
}
