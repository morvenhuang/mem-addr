import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Plus, Edit2, Trash2, LogOut, FileText, Settings, FolderTree } from "lucide-react";
import { Post } from "../../types";

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("admin_auth") !== "true") {
      navigate("/admin/login");
      return;
    }
    fetchPosts();
  }, [navigate]);

  const fetchPosts = () => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then(setPosts);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    navigate("/admin/login");
  };

  const deletePost = (id: string) => {
    if (confirm("Are you sure you want to delete this repository entry?")) {
      fetch(`/api/posts/${id}`, { method: "DELETE" })
        .then(() => fetchPosts());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-8 pt-12"
    >
      <div className="flex justify-between items-end mb-16">
        <div>
          <p className="text-sm font-label uppercase tracking-widest text-on-surface-variant mb-4">
            Curator Workspace
          </p>
          <h1 className="font-headline text-5xl text-primary">Content Repository</h1>
        </div>
        <div className="flex gap-4">
          <Link
            to="/admin/categories"
            className="flex items-center gap-2 bg-surface-container-high text-primary px-6 py-3 rounded font-label text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-all border border-outline-variant/10"
          >
            <FolderTree className="w-4 h-4" /> Hierarchies
          </Link>
          <Link
            to="/admin/editor"
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded font-label text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" /> New Entry
          </Link>
          <button
            onClick={handleLogout}
            className="p-3 rounded-full bg-surface-container-high hover:bg-red-50 text-on-surface-variant hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant/10">
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Title</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Category</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Date</th>
              <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-surface-container-lowest transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-surface-container-high overflow-hidden shrink-0">
                      <img src={post.image} className="w-full h-full object-cover grayscale" />
                    </div>
                    <span className="font-headline text-lg text-primary">{post.title}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-xs font-label uppercase tracking-tighter bg-secondary-container/30 px-2 py-1 rounded">
                    {post.category}
                  </span>
                </td>
                <td className="px-8 py-6 text-sm text-on-surface-variant">{post.date}</td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => navigate(`/admin/editor/${post.id}`)}
                      className="p-2 rounded hover:bg-primary/5 text-primary transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="p-2 rounded hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center">
            <FileText className="w-12 h-12 text-on-surface-variant/20 mb-4" />
            <p className="text-on-surface-variant font-headline text-xl">The repository is currently silent.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
