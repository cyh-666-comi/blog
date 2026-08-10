export default function Footer() {
  return (
    <footer className="border-t border-slate-800 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} 我的博客 — React + Express + SQLite</p>
      </div>
    </footer>
  );
}
