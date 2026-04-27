import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Save, Eye, Edit3, Upload, Image as ImageIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Post, Category } from "../../types";

export default function AdminEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPreview, setIsPreview] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Post>>({
    title: "",
    excerpt: "",
    content: "",
    author: "Julian Thorne",
    category: "literature",
    image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353",
    readTime: "10 min read"
  });

  useEffect(() => {
    if (localStorage.getItem("admin_auth") !== "true") {
      navigate("/admin/login");
      return;
    }

    fetch("/api/categories")
      .then(res => res.json())
      .then(setCategories);

    if (id) {
      fetch(`/api/posts/${id}`)
        .then(res => res.json())
        .then(setFormData);
    }
  }, [id, navigate]);

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const uploadImage = async (file: File): Promise<string> => {
    const base64 = await toBase64(file);
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64 })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Upload failed");
    return data.url;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadImage(file);
        setFormData({ ...formData, image: url });
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && contentRef.current) {
      try {
        const url = await uploadImage(file);
        const textarea = contentRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = formData.content || "";
        const before = text.substring(0, start);
        const after = text.substring(end);
        const insertion = `\n![Image](${url})\n`;
        
        setFormData({
          ...formData, content: before + insertion + after
        });
      } catch (err) {
        console.error("Content image upload failed:", err);
      }
    }
  };

  const getCategoryPath = (categoryId?: string): string => {
    if (!categoryId) return "";
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return categoryId;
    if (cat.parentId) {
      return `${getCategoryPath(cat.parentId)} / ${cat.name}`;
    }
    return cat.name;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/posts/${id}` : "/api/posts";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) })
    }).then(() => navigate("/admin/dashboard"));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-8 pt-12 pb-20"
    >
      <div className="flex justify-between items-center mb-12">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-label uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Table
        </button>
        
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2 bg-surface-container-high text-primary px-4 py-2 rounded font-label text-[10px] font-bold tracking-widest uppercase hover:opacity-90 transition-all border border-outline-variant/10"
          >
            {isPreview ? <><Edit3 className="w-3 h-3" /> Edit Mode</> : <><Eye className="w-3 h-3" /> Preview Signal</>}
          </button>
        </div>
      </div>

      <div className="mb-16">
        <h1 className="font-headline text-5xl text-primary">
          {id ? "Edit Repository Entry" : "Create New Inquiry"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-surface-container-low border-none rounded px-4 py-3 text-lg font-headline text-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Category Signal</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-surface-container-low border-none rounded px-4 py-3 focus:ring-1 focus:ring-primary text-sm font-label"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {getCategoryPath(cat.id)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Cover Image URL / Upload</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="flex-grow bg-surface-container-low border-none rounded px-4 py-3 text-sm focus:ring-1 focus:ring-primary"
                />
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleCoverUpload}
                  className="hidden"
                  accept="image/*"
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="bg-primary/5 text-primary p-3 rounded hover:bg-primary/10 transition-colors border border-primary/10"
                  title="Upload local image"
                >
                  <Upload className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Read Time</label>
              <input
                type="text"
                value={formData.readTime}
                onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                className="w-full bg-surface-container-low border-none rounded px-4 py-3 text-sm focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Excerpt</label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            className="w-full bg-surface-container-low border-none rounded px-4 py-3 text-sm focus:ring-1 focus:ring-primary h-24"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
          <div className={isPreview ? "hidden lg:block lg:opacity-50 pointer-events-none" : "block flex flex-col"}>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Markdown Content</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={contentInputRef}
                  onChange={handleContentImageUpload}
                  className="hidden"
                  accept="image/*"
                />
                <button
                  type="button"
                  onClick={() => contentInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-primary/10 transition-colors border border-primary/10"
                >
                  <ImageIcon className="w-3 h-3" /> Insert Local Image
                </button>
              </div>
            </div>
            <textarea
              ref={contentRef}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="flex-grow w-full bg-surface-container-low border-none rounded px-4 py-3 text-base leading-relaxed focus:ring-1 focus:ring-primary h-full font-mono font-normal text-sm"
              placeholder="# Begin your inquiry..."
              required
            />
          </div>
          <div className={!isPreview ? "hidden lg:block" : "block"}>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Visual Preview</label>
            <div className="w-full bg-surface-container-lowest rounded px-8 py-8 h-full overflow-y-auto border border-outline-variant/10">
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {formData.content || "*Void waits for signal...*"}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-primary text-white px-10 py-4 rounded font-label text-xs font-bold tracking-[0.2em] uppercase hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <Save className="w-4 h-4" /> Commit to Archive
          </button>
        </div>
      </form>
    </motion.div>
  );
}
