import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { Category } from "../../types";

export default function AdminCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Category>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (id?: string) => {
    const isNew = !id;
    const method = isNew ? "POST" : "PUT";
    const url = isNew ? "/api/categories" : `/api/categories/${id}`;

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        fetchCategories();
        setIsEditing(null);
        setShowAddForm(false);
        setEditFormData({});
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto px-8 pt-12 pb-20 font-body"
    >
      <div className="flex justify-between items-center mb-12">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-label uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Table
        </button>
        
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditFormData({ name: "", description: "" });
          }}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded font-label text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> New Category
        </button>
      </div>

      <div className="mb-16">
        <h1 className="font-headline text-5xl text-primary mb-4">Categories</h1>
        <p className="text-on-surface-variant/70 max-w-2xl">
          Manage the classification domains for your archives.
        </p>
      </div>

      {showAddForm && (
        <div className="bg-surface-container-low p-8 rounded-xl border border-primary/10 mb-12">
          <h2 className="font-headline text-2xl text-primary mb-6">New Category</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Category Name</label>
              <input
                type="text"
                value={editFormData.name || ""}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full bg-surface-container-lowest border-none rounded px-4 py-3 text-sm focus:ring-1 focus:ring-primary"
                placeholder="e.g., Programming"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Description</label>
              <textarea
                value={editFormData.description || ""}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                className="w-full bg-surface-container-lowest border-none rounded px-4 py-3 text-sm focus:ring-1 focus:ring-primary h-24"
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-3 rounded font-label text-[10px] font-bold tracking-widest uppercase hover:bg-surface-container-high transition-all"
            >
              Discard
            </button>
            <button
              onClick={() => handleSave()}
              className="bg-primary text-white px-6 py-3 rounded font-label text-[10px] font-bold tracking-widest uppercase hover:opacity-90 transition-all"
            >
              Add Category
            </button>
          </div>
        </div>
      )}

      <div className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container border-b border-outline-variant/10">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/70">Name</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/70">Posts</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/70">Description</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/70 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-outline-variant/5 hover:bg-surface-container-high/30 transition-colors">
                <td className="px-8 py-6">
                  {isEditing === category.id ? (
                    <input
                      type="text"
                      value={editFormData.name || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="bg-surface-container-lowest border-none rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary w-full font-bold"
                    />
                  ) : (
                    <span className="text-primary font-bold">{category.name}</span>
                  )}
                </td>
                <td className="px-8 py-6">
                  <span className="font-mono text-sm text-on-surface-variant">{category.count} item{category.count !== 1 ? "s" : ""}</span>
                </td>
                <td className="px-8 py-6 max-w-md">
                  {isEditing === category.id ? (
                    <textarea
                      value={editFormData.description || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      className="bg-surface-container-lowest border-none rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary w-full h-20"
                    />
                  ) : (
                    <p className="text-sm text-on-surface-variant/80 line-clamp-1">{category.description}</p>
                  )}
                </td>
                <td className="px-8 py-6">
                  <div className="flex gap-4 justify-end">
                    {isEditing === category.id ? (
                      <>
                        <button onClick={() => handleSave(category.id)} className="p-2 text-primary hover:bg-primary/5 rounded transition-colors"><Save className="w-4 h-4" /></button>
                        <button onClick={() => setIsEditing(null)} className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded transition-colors"><X className="w-4 h-4" /></button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => {
                            setIsEditing(category.id);
                            setEditFormData(category);
                          }}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(category.id)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/5 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
