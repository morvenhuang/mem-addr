import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") { // Simple mock auth
      localStorage.setItem("admin_auth", "true");
      navigate("/admin/dashboard");
    } else {
      alert("Invalid credentials. Hint: admin123");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-10 bg-surface-container-lowest rounded-xl shadow-xl shadow-primary/5"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center mb-4">
            <Lock className="text-primary w-6 h-6" />
          </div>
          <h1 className="font-headline text-2xl text-primary">Curator Gate</h1>
          <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mt-2">
            Identity Verification Required
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Passphrase
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded px-4 py-3 text-sm focus:ring-1 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded font-label text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-opacity"
          >
            Access Repository
          </button>
        </form>
      </motion.div>
    </div>
  );
}
