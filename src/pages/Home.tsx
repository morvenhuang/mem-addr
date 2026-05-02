import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Signal } from "lucide-react";
import { Post, Category } from "../types";

export default function Home() {
  const { id: categoryId } = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/posts").then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json()),
    ])
      .then(([postsData, categoriesData]) => {
        setPosts(postsData);
        setCategories(categoriesData);
      })
      .finally(() => setLoading(false));
  }, []);

  const getCategoryName = (id: string) => {
    return categories.find((c) => c.id.toLowerCase() === id.toLowerCase())?.name || id;
  };

  const filteredPosts = categoryId
    ? posts.filter((p) => (p.category || "").toLowerCase() === categoryId.toLowerCase())
    : posts;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center font-headline animate-pulse text-on-surface-variant/40 uppercase tracking-[0.2em] text-xs">
        Connecting to signal...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-8 pt-12 pb-32 font-body"
    >
      {categoryId && (
        <div className="mb-12">
          <div className="flex items-center gap-4 py-6 border-b border-outline-variant/10 mb-8">
            <Signal className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-headline text-primary uppercase tracking-widest font-black">
              Domain: {getCategoryName(categoryId)}
            </h2>
            <Link to="/" className="ml-auto text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
              Reset Signal
            </Link>
          </div>
        </div>
      )}

      {filteredPosts.length > 0 ? (
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-xl overflow-hidden hover:shadow-[0px_12px_32px_rgba(0,25,39,0.06)] transition-all bg-surface-container-lowest flex flex-col group"
              >
                <Link to={`/article/${post.id}`} className="flex flex-col h-full">
                  <div className="relative overflow-hidden h-56">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <span className="bg-surface-container-high text-[10px] font-bold px-2 py-1 rounded mb-4 w-fit">
                      #{getCategoryName(post.category)}
                    </span>
                    <h3 className="text-xl font-headline text-primary mb-4 leading-snug group-hover:text-secondary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto pt-6 border-t border-outline-variant/10 flex justify-between items-center">
                      <span className="text-[10px] text-on-surface-variant/60 uppercase font-label tracking-widest">
                        {post.date}
                      </span>
                      <span className="text-[10px] text-on-surface-variant/40 font-medium">
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
  ) : (
    <div className="py-32 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-6">
            <Signal className="w-8 h-8 text-on-surface-variant/20" />
          </div>
          <h3 className="text-2xl font-headline text-primary mb-2">Signal Lost</h3>
          <p className="text-on-surface-variant max-w-sm font-body">
            No archives found in this specific domain of inquiry yet. Explore other branches of the knowledge map.
          </p>
          <Link to="/categories" className="mt-8 text-xs font-bold uppercase tracking-widest text-primary hover:underline">
            View Structural Map
          </Link>
        </div>
      )}
    </motion.div>
  );
}
