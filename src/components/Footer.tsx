
export default function Footer() {
  return (
    <footer className="w-full py-12 mt-20 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-headline text-lg text-primary">
          Mem Addr
        </div>
        <div className="font-label text-xs uppercase tracking-widest text-on-surface-variant text-center md:text-right">
          © 2026 Mem Addr.
        </div>
      </div>
    </footer>
  );
}
