import { motion } from "motion/react";

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-8 pt-12 font-body"
    >
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Visual Side */}
        <div className="relative group">
          <div className="aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-low">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
              alt="Portrait"
              className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 transition-all duration-700"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/5 -z-10 rounded-full blur-3xl"></div>
        </div>

        {/* Textual Bio Side */}
        <div className="flex flex-col">
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">About Me</span>
          <h1 className="font-headline text-5xl md:text-6xl text-primary leading-tight mb-8">
            Old-School Programmer <br />& Vibe Coder
          </h1>
          <div className="space-y-6 text-on-surface-variant leading-relaxed text-lg font-body">
            <p>
              A lover of classical Chinese poetry and calligraphy, a data nomad wandering through bits and bytes, a traditional programmer and a vibe coder, an international corporate cog, a big-tech workhorse. Actively contributing to open source, while spending most days in the company of Java, Python, big data, distributed systems, and ad recommendation engines.
            </p>
          </div>
        </div>
      </section>

    </motion.div>
  );
}
