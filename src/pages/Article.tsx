import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Post, Category } from "../types";

export default function Article() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((res) => res.json())
      .then(setPost);
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, [id]);

  const getCategoryName = (catId: string) => {
    return categories.find(c => c.id === catId)?.name || catId;
  };

  if (!post) return <div className="h-screen flex items-center justify-center font-headline">Distilling signal...</div>;

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen font-body"
    >
      <header className="w-full pt-12">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex items-center gap-3 mb-8 text-on-surface-variant/60 font-label">
            <span className="text-[0.75rem] font-bold tracking-widest text-primary bg-secondary-container/30 px-3 py-1 rounded-full uppercase">
              {getCategoryName(post.category)}
            </span>
            <span className="text-[0.75rem]">
              {post.date}
            </span>
            <span className="text-[0.75rem]">
              {post.readTime}
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-black text-primary leading-[1.1] mb-12 tracking-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 rounded-full bg-surface-container-high overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                alt={post.author}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-primary font-label">{post.author}</p>
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-label">Editorial Director & Curator</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto px-8 mb-12">
          <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-surface-container-low shadow-2xl shadow-primary/5">
            <img
              src={post.heroImage || post.image}
              alt="Hero"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-4 text-center text-[10px] uppercase tracking-widest text-on-surface-variant font-label">
            Visual resonance within the Mem Addr archives.
          </p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-8 pb-32">
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content || post.excerpt}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        <div className="mt-20 flex flex-wrap gap-2">
          {["PHILOSOPHY", "DESIGN", "SYSTEMS"].map(tag => (
            <span key={tag} className="px-3 py-1 bg-surface-container-high text-[0.65rem] font-bold tracking-widest uppercase text-primary font-label">
              #{tag}
            </span>
          ))}
        </div>

        {/* Post Nav */}
        <nav className="mt-32 pt-12 border-t border-outline-variant/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <Link to="#" className="group max-w-xs">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2 block">Previous Article</span>
              <h5 className="text-xl font-headline text-primary group-hover:text-secondary transition-colors">
                The Digital Tactile: Textures in Code
              </h5>
            </Link>
            <Link to="#" className="group text-right max-w-xs">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2 block">Next Article</span>
              <h5 className="text-xl font-headline text-primary group-hover:text-secondary transition-colors">
                Ephemeral Archives and the Cloud
              </h5>
            </Link>
          </div>
        </nav>
      </section>
    </motion.article>
  );
}
