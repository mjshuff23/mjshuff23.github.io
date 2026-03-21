import { motion } from "framer-motion";
import { SectionHeading } from "./SectionHeading";
import { SKILLS as skillCategories } from "@/data/resume";

const MAX_LEVEL = 5;

function SkillDots({ level }: { level: number }) {
  return (
    <span className="flex gap-0.5 ml-1.5 items-center shrink-0">
      {Array.from({ length: MAX_LEVEL }).map((_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i < level ? "bg-primary" : "bg-border"}`}
        />
      ))}
    </span>
  );
}

export function Skills() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-24 bg-card/30" id="skills">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Technical Matrix" index="02" subtitle="Core competencies & frameworks" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((category, idx) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-background border border-border p-6 rounded-xl hover:border-primary/30 transition-all duration-300"
            >
              <h3 className="text-xl font-display font-semibold text-foreground mb-4 border-b border-border pb-2 inline-block">
                {category.title}
              </h3>
              <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex flex-wrap gap-2"
              >
                {category.skills.map((skill) => {
                  const name = typeof skill === "string" ? skill : skill.name;
                  const level = typeof skill === "string" ? null : skill.level;
                  return (
                    <motion.span
                      key={name}
                      variants={item}
                      className="flex items-center px-3 py-1 bg-secondary text-secondary-foreground font-mono text-xs sm:text-sm rounded border border-border hover:border-primary/50 hover:text-primary transition-colors cursor-default"
                    >
                      {name}
                      {level !== null && <SkillDots level={level} />}
                    </motion.span>
                  );
                })}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
