import { motion } from "framer-motion";
import { SectionHeading } from "./SectionHeading";
import { EXPERIENCE as experiences } from "@/data/resume";

export function Experience() {
  return (
    <section className="py-24 bg-card/30" id="experience">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Operational History" index="04" subtitle="Professional Experience" />

        <div className="relative border-l-2 border-primary/20 pl-8 ml-4 md:ml-0 space-y-16">
          {experiences.map((exp, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative group"
            >
              {/* Timeline Node */}
              <div className="absolute -left-[41px] top-1.5 w-5 h-5 rounded-full bg-background border-2 border-primary group-hover:bg-primary transition-colors shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
              
              <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-4">
                <h3 className="text-2xl font-display font-bold text-foreground uppercase tracking-wide">
                  {exp.title}
                </h3>
                <span className="text-primary font-mono text-sm md:text-base border-l border-primary/30 pl-0 md:pl-4 hidden md:inline">
                  {exp.company}
                </span>
                <span className="text-primary font-mono text-sm md:hidden block">
                  {exp.company}
                </span>
              </div>
              
              <div className="mb-6 inline-block px-3 py-1 bg-secondary text-muted-foreground font-mono text-xs rounded border border-border">
                {exp.date}
              </div>

              <ul className="space-y-3">
                {exp.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-sm bg-primary/50 shrink-0 transform rotate-45" />
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
