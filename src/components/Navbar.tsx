import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => setAvatar(data.avatar));
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Categories", path: "/categories" },
    { name: "About", path: "/about" },
    { name: "Admin", path: "/admin/login" },
  ];

  return (
    <header className="glass-nav">
      <nav className="flex justify-between items-center max-w-7xl mx-auto px-8 h-20">
        <div className="flex items-center gap-4">
          {avatar && (
            <Link to="/about" className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/20 hover:border-primary transition-colors">
              <img src={avatar} alt="Author" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
            </Link>
          )}
          <Link to="/" className="font-headline text-2xl font-bold tracking-tight text-primary">
            Mem Addr
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-label font-medium transition-colors relative hover:text-primary ${
                location.pathname === link.path ? "text-primary font-semibold after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full" : "text-on-surface-variant/70"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
