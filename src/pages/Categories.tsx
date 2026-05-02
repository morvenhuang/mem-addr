import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Category } from "../types";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-8 pt-12 pb-32"
    >
      <div className="mb-16">
        <h1 className="font-headline text-5xl text-primary mb-4">Categories</h1>
        <p className="text-on-surface-variant/70 max-w-2xl">
          Browse the archive by domain of inquiry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.id}`}
            className="p-8 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all flex flex-col justify-between group h-64 border border-outline-variant/10"
          >
            <div>
              <h3 className="font-headline text-2xl text-primary mb-2 group-hover:translate-x-1 transition-transform">
                {cat.name}
              </h3>
              <p className="text-sm text-on-surface-variant/80 line-clamp-3 leading-relaxed">
                {cat.description}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50">
                {cat.count} Archive{cat.count !== 1 ? "s" : ""}
              </span>
              <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
