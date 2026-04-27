import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Signal } from "lucide-react";
import { Post, Category } from "../types";

export default function Home() {
  const { id: categoryId } = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then(setPosts);
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || id;
  };

  const filteredPosts = categoryId 
    ? posts.filter(p => p.category === categoryId)
    : posts;

  const featured = filteredPosts[0];
  const insights = filteredPosts.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-8 pt-12 font-body"
    >
      {categoryId && (
        <div className="mb-12 flex items-center gap-4 py-6 border-b border-outline-variant/10">
          <Signal className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-headline text-primary uppercase tracking-widest font-black">
            Domain: {getCategoryName(categoryId)}
          </h2>
          <Link to="/" className="ml-auto text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
            Reset Signal
          </Link>
        </div>
      )}

      {featured && (
        <section className="mb-20">
          <div className="relative overflow-hidden rounded-xl bg-surface-container-low group">
            <div className="flex flex-col md:flex-row items-stretch">
              <div className="md:w-3/5 overflow-hidden">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="w-full h-[400px] md:h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="md:w-2/5 p-12 flex flex-col justify-center bg-surface-container-lowest">
                <span className="text-xs font-label uppercase tracking-widest text-on-primary-container mb-4">
                  Featured Article
                </span>
                <h1 className="text-4xl md:text-5xl font-headline font-black text-primary leading-tight mb-6">
                  {featured.title}
                </h1>
                <p className="text-on-surface-variant leading-relaxed mb-8 font-body">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-4 mb-10">
                  <div className="bg-surface-container-high px-3 py-1 rounded text-[10px] font-bold tracking-tighter text-primary">
                    #{getCategoryName(featured.category)}
                  </div>
                  <span className="text-xs text-on-surface-variant/60 font-medium">
                    {featured.readTime}
                  </span>
                </div>
                <Link
                  to={`/article/${featured.id}`}
                  className="bg-primary text-white px-8 py-4 w-fit rounded-lg hover:opacity-90 transition-all font-label font-semibold text-sm inline-block"
                >
                  READ ARTICLE
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-headline text-primary">Curated Insights</h2>
            <p className="text-on-surface-variant font-label text-sm mt-2 tracking-wide uppercase">
              Latest explorations in technology and arts
            </p>
          </div>
          <div className="hidden md:flex gap-2">
            <button className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-secondary-container transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-secondary-container transition-colors">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {filteredPosts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-xl overflow-hidden hover:shadow-[0px_12px_32px_rgba(0,25,39,0.06)] transition-all bg-surface-container-lowest ${
                idx === 1 ? "md:col-span-8" : "md:col-span-4"
              }`}
            >
              <Link to={`/article/${post.id}`} className="flex flex-col h-full">
                {idx === 1 ? (
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="md:w-1/2">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="md:w-1/2 p-8 flex flex-col justify-between">
                      <div>
                        <span className="bg-surface-container-high text-[10px] font-bold px-2 py-1 rounded mb-4 inline-block">
                          #{getCategoryName(post.category)}
                        </span>
                        <h3 className="text-2xl font-headline text-primary mb-4 leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="mt-8 pt-6 border-t border-outline-variant/10 flex justify-between items-center">
                        <span className="text-[10px] text-on-surface-variant/60 uppercase font-label tracking-widest">
                          {post.date}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
                    <div className="p-8 flex flex-col flex-grow">
                      <span className="bg-surface-container-high text-[10px] font-bold px-2 py-1 rounded mb-4 w-fit">
                        #{getCategoryName(post.category)}
                      </span>
                      <h3 className="text-xl font-headline text-primary mb-4">
                        {post.title}
                      </h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                        {post.excerpt}
                      </p>
                      <div className="mt-auto pt-6 border-t border-outline-variant/10">
                        <span className="text-[10px] text-on-surface-variant/60 uppercase font-label tracking-widest">
                          {idx === 0 ? post.readTime : post.date}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
