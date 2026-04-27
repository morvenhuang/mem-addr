import { Link, useLocation } from "react-router-dom";
import { Search, Settings } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Categories", path: "/categories" },
    { name: "AI", path: "/category/ai" },
    { name: "Programming", path: "/category/programming" },
    { name: "Literature", path: "/category/literature" },
    { name: "About", path: "/about" },
    { name: "Admin", path: "/admin/login" },
  ];

  return (
    <header className="glass-nav">
      <nav className="flex justify-between items-center max-w-7xl mx-auto px-8 h-20">
        <Link to="/" className="font-headline text-2xl font-bold tracking-tight text-primary">
          Mem Addr
        </Link>
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
        <div className="flex items-center space-x-6">
          <button className="hover:opacity-80 transition-opacity text-primary">
            <Search className="w-5 h-5" />
          </button>
          <button className="hover:opacity-80 transition-opacity text-primary">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </nav>
    </header>
  );
}
