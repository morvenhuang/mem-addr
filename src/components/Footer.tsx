import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full py-12 mt-20 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-headline text-lg text-primary">
          Mem Addr
        </div>
        <div className="flex flex-wrap justify-center gap-8 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
          <Link to="/archives" className="hover:text-primary transition-colors">Archives</Link>
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="/rss" className="hover:text-primary transition-colors">RSS Feed</Link>
        </div>
        <div className="font-label text-xs uppercase tracking-widest text-on-surface-variant text-center md:text-right">
          © 2024 Mem Addr. Curated with intentionality.
        </div>
      </div>
    </footer>
  );
}
