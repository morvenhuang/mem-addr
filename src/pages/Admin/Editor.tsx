import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Save, Eye, Edit3, Upload, Image as ImageIcon, Search, X } from "lucide-react";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import { Post, Category } from "../../types";

interface UnsplashPhoto {
  id: string;
  description: string;
  thumb: string;
  small: string;
  regular: string;
  full: string;
  raw: string;
  author: string;
  authorLink: string;
  width: number;
  height: number;
}

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
    content: "",
    author: "Morven",
    category: "ai",
    image: "",
    tags: [] as string[],  });

  // Unsplash search modal state
  const [showUnsplash, setShowUnsplash] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UnsplashPhoto[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<UnsplashPhoto | null>(null);
  const [searchError, setSearchError] = useState("");

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

  const buildUnsplashUrl = (raw: string, w: number) => {
    return `${raw}&w=${w}&q=85&auto=format&fit=crop&crop=entropy`;
  };

  const handleUnsplashSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError("");
    try {
      const res = await fetch(`/api/unsplash/search?query=${encodeURIComponent(searchQuery.trim())}`);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Search failed");
      }
      const data = await res.json();
      setSearchResults(data.results || []);
      if (data.results?.length === 0) setSearchError("No results found");
    } catch (err: any) {
      setSearchError(err.message || "Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectPhoto = (photo: UnsplashPhoto) => {
    setSelectedPhoto(photo);
  };

  const handleConfirmPhoto = () => {
    if (!selectedPhoto) return;
    const url = buildUnsplashUrl(selectedPhoto.raw, 1600);
    setFormData({ ...formData, image: url });
    setShowUnsplash(false);
    setSelectedPhoto(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleCloseUnsplash = () => {
    setShowUnsplash(false);
    setSelectedPhoto(null);
    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
  };

  const getCategoryPath = (categoryId?: string): string => {
    if (!categoryId) return "";
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return categoryId;
    return cat.name;
  };

  const computeReadTime = (text: string): string => {
    const t = (text || "").trim();
    // Count Chinese characters (CJK range)
    const chineseChars = (t.match(/[一-鿿㐀-䶿]/g) || []).length;
    // Count English words (non-CJK)
    const englishWords = t.replace(/[一-鿿㐀-䶿]/g, "").trim().split(/\s+/).filter(Boolean).length;
    // Chinese: ~400 chars/min, English: ~200 words/min
    const minutes = Math.max(1, Math.ceil(chineseChars / 400 + englishWords / 200));
    return `${minutes} min read`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/posts/${id}` : "/api/posts";
    const now = new Date().toISOString();
    const displayDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const body: any = {
      ...formData,
      readTime: computeReadTime(formData.content || ""),
      updatedAt: now,
    };

    // On create, also set initial date
    if (!id) {
      body.date = displayDate;
      body.createdAt = now;
    }

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
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
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 mt-4">Tags</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {(formData.tags || []).map((tag: string, i: number) => (
                  <span key={i} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-label">
                    {tag}
                    <button type="button" onClick={() => setFormData({ ...formData, tags: (formData.tags || []).filter((_: string, j: number) => j !== i) })} className="hover:text-red-500 transition-colors">&times;</button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Type tag and press Enter"
                className="w-full bg-surface-container-low border-none rounded px-4 py-3 text-sm focus:ring-1 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value.trim().toUpperCase();
                    if (val && !(formData.tags || []).includes(val)) {
                      setFormData({ ...formData, tags: [...(formData.tags || []), val] });
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }}
              />
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
                <button
                  type="button"
                  onClick={() => setShowUnsplash(true)}
                  className="bg-primary/5 text-primary p-3 rounded hover:bg-primary/10 transition-colors border border-primary/10"
                  title="Search Unsplash"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>
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
                <MarkdownRenderer>
                  {formData.content || "*Void waits for signal...*"}
                </MarkdownRenderer>
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

      {/* Unsplash Search Modal */}
      {showUnsplash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={handleCloseUnsplash}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/10">
              <h2 className="font-headline text-2xl text-primary">Search Unsplash</h2>
              <button
                type="button"
                onClick={handleCloseUnsplash}
                className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search bar */}
            <form onSubmit={handleUnsplashSearch} className="px-8 py-4 border-b border-outline-variant/5">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search keywords (space-separated)..."
                  className="flex-grow bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="bg-primary text-white px-6 py-3 rounded-lg font-label text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {searchLoading ? "Searching..." : "Search"}
                </button>
              </div>
            </form>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {searchError && (
                <p className="text-on-surface-variant/60 text-center py-12 font-label uppercase tracking-widest text-xs">{searchError}</p>
              )}

              {searchResults.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {searchResults.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => handleSelectPhoto(photo)}
                      className={`relative aspect-[16/9] rounded-lg overflow-hidden group focus:outline-none ${
                        selectedPhoto?.id === photo.id
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-surface-container-lowest"
                          : "hover:ring-1 hover:ring-primary/30"
                      }`}
                    >
                      <img
                        src={photo.small}
                        alt={photo.description}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-[10px] font-label uppercase tracking-wider truncate">
                          {photo.author}
                        </p>
                      </div>
                      {selectedPhoto?.id === photo.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {searchResults.length === 0 && !searchError && (
                <p className="text-on-surface-variant/40 text-center py-12 font-label uppercase tracking-widest text-xs">
                  Enter keywords and press Search to discover images
                </p>
              )}
            </div>

            {/* Footer with confirm button */}
            {searchResults.length > 0 && (
              <div className="px-8 py-4 border-t border-outline-variant/10 flex justify-between items-center">
                <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/50">
                  {selectedPhoto ? `Selected: ${selectedPhoto.author}` : "Select an image above"}
                </p>
                <button
                  type="button"
                  onClick={handleConfirmPhoto}
                  disabled={!selectedPhoto}
                  className="bg-primary text-white px-8 py-3 rounded-lg font-label text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-all disabled:opacity-30"
                >
                  Confirm & Use This Image
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
