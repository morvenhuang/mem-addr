import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Plus, Edit2, Trash2, LogOut, FileText, Settings, FolderTree } from "lucide-react";
import { Post } from "../../types";

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("admin_auth") !== "true") {
      navigate("/admin/login");
      return;
    }
    fetchPosts();
    fetchProfile();
  }, [navigate]);

  const fetchPosts = () => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then(setPosts);
  };

  const fetchProfile = () => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then(setProfile);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    navigate("/admin/login");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    }).then(() => {
      setIsEditingProfile(false);
      fetchProfile();
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: reader.result }),
      })
        .then((res) => res.json())
        .then((data) => {
          setProfile({ ...profile, avatar: data.url });
        });
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.new }),
      });
      if (res.ok) {
        setPasswordSuccess(true);
        setPasswordForm({ current: "", new: "" });
      } else {
        const data = await res.json();
        setPasswordError(data.message || "Failed to update password");
      }
    } catch {
      setPasswordError("Server unreachable");
    }
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
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="flex items-center gap-2 bg-surface-container-high text-primary px-6 py-3 rounded font-label text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-all border border-outline-variant/10"
          >
            <Settings className="w-4 h-4" /> {isEditingProfile ? "View Repository" : "Profile Settings"}
          </button>
          <Link
            to="/admin/categories"
            className="flex items-center gap-2 bg-surface-container-high text-primary px-6 py-3 rounded font-label text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-all border border-outline-variant/10"
          >
            <FolderTree className="w-4 h-4" /> Categories
          </Link>
          <Link
            to="/admin/editor"
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded font-label text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" /> New Article
          </Link>
          <button
            onClick={handleLogout}
            className="p-3 rounded-full bg-surface-container-high hover:bg-red-50 text-on-surface-variant hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {isEditingProfile && profile ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-low rounded-xl p-8 max-w-2xl mx-auto border border-outline-variant/10"
        >
          <div className="flex items-center gap-8 mb-12">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-surface-container-high border-2 border-primary/10">
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity rounded-full">
                <Edit2 className="w-6 h-6" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </label>
            </div>
            <div>
              <h2 className="font-headline text-2xl text-primary mb-1">Author Identity</h2>
              <p className="text-sm text-on-surface-variant font-label uppercase tracking-widest">Digital Persona Management</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Display Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded px-4 py-3 text-primary focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Biographical Fragment</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={4}
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded px-4 py-3 text-primary focus:outline-none focus:border-primary/50 resize-none leading-relaxed"
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-primary text-white py-4 rounded font-label text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-all shadow-lg shadow-primary/10"
              >
                Update Identity
              </button>
            </div>
          </form>

          <hr className="border-outline-variant/10 my-8" />

          <form onSubmit={handleChangePassword} className="space-y-4">
            <h3 className="font-headline text-lg text-primary mb-1">Change Passphrase</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-4">Update your curator gate credentials</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Current Passphrase</label>
                <input
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded px-4 py-3 text-primary focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">New Passphrase</label>
                <input
                  type="password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded px-4 py-3 text-primary focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
            {passwordError && <p className="text-red-500 text-xs mb-3 font-label uppercase tracking-wide">{passwordError}</p>}
            {passwordSuccess && <p className="text-green-500 text-xs mb-3 font-label uppercase tracking-wide">Passphrase updated successfully</p>}
            <button
              type="submit"
              className="w-full border border-outline-variant/20 text-primary py-3 rounded font-label text-xs font-bold tracking-widest uppercase hover:bg-primary/5 transition-all"
            >
              Update Passphrase
            </button>
          </form>
        </motion.div>
      ) : (
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
    )}
    </motion.div>
  );
}
