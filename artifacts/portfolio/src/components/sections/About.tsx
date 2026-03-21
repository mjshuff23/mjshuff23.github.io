import { motion } from "framer-motion";
import { SectionHeading } from "./SectionHeading";
import { Terminal, ShieldAlert, Cpu, Activity } from "lucide-react";

export function About() {
  const stats = [
    { label: "Technical Experience", value: "23+ Years", icon: Terminal },
    { label: "ARR Impact", value: "$30M+", icon: Activity },
    { label: "Engineers Mentored", value: "75+", icon: Cpu },
    { label: "Specialization", value: "AI Safeguards", icon: ShieldAlert },
  ];

  return (
    <section className="py-24 relative" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title="System Profile" index="01" subtitle="Background & Directives" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* Main Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="glass-panel p-8 rounded-xl box-glow-hover transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              
              <p className="text-lg text-foreground leading-relaxed font-light">
                Systems-focused builder with a <span className="text-primary font-semibold">23-year technical trajectory</span> rooted in a lifelong obsession with systems analysis and reverse-engineering, beginning in 1998. 
              </p>
              <br />
              <p className="text-lg text-muted-foreground leading-relaxed">
                Complemented by 5+ years of professional leadership driving $30M+ in ARR through global-scale discovery platforms and scaling multi-continental retail infrastructure for the world's largest brands. 
              </p>
              <br />
              <p className="text-lg text-muted-foreground leading-relaxed">
                Leverages decades of systems-level intuition to prioritize deterministic integrity, currently specializing in AI Safeguards through the engineering of <span className="text-primary font-mono bg-primary/10 px-1 py-0.5 rounded">neuro-symbolic circuit breakers</span> to mitigate deceptive model behaviors.
              </p>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {stats.map((stat, i) => (
              <div 
                key={stat.label}
                className="bg-card border border-border p-6 rounded-xl hover:border-primary/50 transition-colors group flex flex-col justify-center"
              >
                <stat.icon className="w-8 h-8 text-primary/50 group-hover:text-primary mb-4 transition-colors" />
                <h4 className="text-3xl font-display font-bold text-foreground mb-1">{stat.value}</h4>
                <p className="text-sm font-mono text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
