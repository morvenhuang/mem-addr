import { motion } from "motion/react";
import { useEffect, useState } from "react";

export default function About() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then(setProfile);
  }, []);

  if (!profile) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-8 pt-20 pb-32 font-body"
    >
      <section className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* Visual Side */}
        <div className="relative group shrink-0">
          <div className="w-56 h-56 lg:w-72 lg:h-72 rounded-2xl overflow-hidden bg-surface-container-low shadow-xl shadow-primary/5">
            <img
              src={profile.avatar}
              alt="Portrait"
              className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 transition-all duration-700"
            />
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 -z-10 rounded-full blur-3xl"></div>
        </div>

        {/* Textual Bio Side */}
        <div className="flex flex-col text-center lg:text-left">
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">About Me</span>
          <div className="text-on-surface-variant leading-relaxed text-base md:text-lg font-body max-w-xl">
            {(profile.bio || "").split("\n").map((line: string, i: number) => (
              <p key={i}>
                {line}
              </p>
            ))}          </div>
        </div>
      </section>
    </motion.div>
  );
}
