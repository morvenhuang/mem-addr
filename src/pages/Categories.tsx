import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, PlusCircle, Flower, Terminal } from "lucide-react";
import { Category } from "../types";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  const rootCategories = categories.filter(c => !c.parentId);
  const getSubcategories = (parentId: string) => categories.filter(c => c.parentId === parentId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-8 pt-12 pb-32"
    >
      <div className="space-y-24">
        {rootCategories.map((root) => {
          const children = getSubcategories(root.id);
          return (
            <section key={root.id}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-t border-outline-variant/10 pt-12">
                <div className="md:col-span-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary bg-primary/5 px-3 py-1 rounded inline-block mb-6">
                    Primary Domain
                  </span>
                  <h2 className="font-headline text-4xl text-primary mb-4">{root.name}</h2>
                  <p className="text-on-surface-variant leading-relaxed mb-6">
                    {root.description}
                  </p>
                  <Link
                    to={`/category/${root.id}`}
                    className="inline-flex items-center gap-2 text-sm font-label font-bold uppercase tracking-widest text-primary hover:gap-4 transition-all"
                  >
                    Examine Domain <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                
                <div className="md:col-span-8">
                  {children.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {children.map((child) => (
                        <Link
                          key={child.id}
                          to={`/category/${child.id}`}
                          className="p-8 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all flex flex-col justify-between group h-64"
                        >
                          <div>
                            <h3 className="font-headline text-2xl text-primary mb-2 group-hover:translate-x-1 transition-transform">{child.name}</h3>
                            <p className="text-xs text-on-surface-variant/80 line-clamp-2 leading-relaxed italic">
                              {child.description}
                            </p>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50">
                              {child.count} ARCHIVES
                            </span>
                            <PlusCircle className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center p-12 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/20">
                      <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant/40">No sub-domains defined</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </motion.div>
  );
}

