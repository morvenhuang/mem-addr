import { motion } from "motion/react";
import { Terminal, Book, Layout, History } from "lucide-react";

export default function About() {
  const interests = [
    { title: "AI Philosophy", desc: "Exploring the ethics of machine consciousness and the future of human creativity.", icon: <Terminal className="w-6 h-6" /> },
    { title: "Classical Lit", desc: "Finding timeless wisdom in the margins of 19th-century philosophical texts.", icon: <Book className="w-6 h-6" /> },
    { title: "Systems Design", desc: "Building elegant digital architectures that prioritize human experience over metrics.", icon: <Layout className="w-6 h-6" /> },
    { title: "The Archives", desc: "Preserving the high-fidelity signals in an increasingly low-resolution world.", icon: <History className="w-6 h-6" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-8 pt-12 font-body"
    >
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
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
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase font-label">Coordinates</span>
              <div className="h-px flex-1 bg-outline-variant/20"></div>
            </div>
            <p className="font-headline text-lg text-secondary">
              "The unexamined digital life is not worth scrolling."
            </p>
          </div>
        </div>

        {/* Textual Bio Side */}
        <div className="flex flex-col">
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">Curator & Intellect</span>
          <h1 className="font-headline text-5xl md:text-6xl text-primary leading-tight mb-8">
            In pursuit of <br /><span>intentional</span> knowledge.
          </h1>
          <div className="space-y-6 text-on-surface-variant leading-relaxed text-lg font-body">
            <p>
              I am a digital curator living at the intersection of classical humanities and the burgeoning frontier of artificial intelligence. My work involves distilling the noise of the information age into coherent narratives that respect the gravity of the past and the velocity of the future.
            </p>
            <p>
              Through <span className="text-primary font-medium">Mem Addr</span>, I explore how programming isn't just about logic, but a new form of literature—a syntax that builds worlds instead of just describing them.
            </p>
          </div>

          {/* Areas of Interest */}
          <div className="mt-16 grid grid-cols-2 gap-4">
            {interests.map((item, idx) => (
              <div key={idx} className="p-6 rounded-xl bg-surface-container-lowest transition-all hover:bg-surface-container hover:shadow-lg hover:shadow-primary/5">
                <div className="text-primary mb-4">{item.icon}</div>
                <h3 className="font-headline text-xl mb-2">{item.title}</h3>
                <p className="text-sm font-body text-on-surface-variant">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="mt-32 p-12 rounded-xl bg-primary-container text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary to-transparent opacity-20"></div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="font-headline text-3xl text-white mb-6">Manifesto</h2>
          <div className="space-y-6 opacity-80 font-body">
            <p className="text-xl leading-relaxed">
              "Curating is the act of deciding what matters. In an age of infinite reproduction, the most radical act is to choose a few things and care for them deeply."
            </p>
            <div className="pt-6">
              <button className="bg-primary text-white px-8 py-3 rounded text-sm tracking-widest font-label uppercase hover:opacity-90 transition-all border border-white/10">
                Read the full thesis
              </button>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
