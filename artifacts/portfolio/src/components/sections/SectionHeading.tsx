import { motion } from "framer-motion";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  index?: string;
}

export function SectionHeading({ title, subtitle, index }: SectionHeadingProps) {
  return (
    <div className="mb-12 md:mb-20">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="flex items-end gap-4 mb-4"
      >
        {index && (
          <span className="text-2xl md:text-4xl font-display font-light text-primary/40 leading-none">
            {index}.
          </span>
        )}
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground uppercase tracking-wider">
          {title}
        </h2>
        <div className="h-[2px] flex-grow bg-gradient-to-r from-border to-transparent hidden md:block" />
      </motion.div>
      
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground font-mono text-sm md:text-base border-l-2 border-primary/50 pl-4 ml-[2px]"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
