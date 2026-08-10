import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categoriesAPI } from '../api/client';

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    categoriesAPI.getList().then(res => setCategories(res.data)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = e.target.q.value.trim();
    if (q) navigate(`/?search=${encodeURIComponent(q)}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-cyan-400 hover:text-cyan-300 transition tracking-wide">
            ◈ 我的博客
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-slate-300 hover:text-cyan-400 transition text-sm font-medium">首页</Link>
            {categories.slice(0, 5).map(cat => (
              <Link key={cat.id} to={`/category/${cat.slug}`} className="text-slate-400 hover:text-cyan-400 transition text-sm">
                {cat.name}
              </Link>
            ))}
          </div>

          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <input
              name="q" type="text" placeholder="搜索..."
              className="w-36 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-l-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition"
            />
            <button type="submit" className="px-4 py-1.5 bg-cyan-600 text-white rounded-r-lg text-sm hover:bg-cyan-500 transition font-medium">
              搜索
            </button>
          </form>

          <a href="/admin" className="hidden md:block text-slate-500 hover:text-cyan-400 transition text-sm" title="后台管理">
            ⚙️
          </a>

          <button className="md:hidden p-2 text-slate-400" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-800">
            <div className="flex flex-col space-y-2 pt-3">
              <Link to="/" className="text-slate-300 py-1" onClick={() => setMenuOpen(false)}>首页</Link>
              {categories.map(cat => (
                <Link key={cat.id} to={`/category/${cat.slug}`} className="text-slate-400 py-1" onClick={() => setMenuOpen(false)}>
                  {cat.name}
                </Link>
              ))}
              <a href="/admin" className="text-slate-500 py-1 text-sm" onClick={() => setMenuOpen(false)}>⚙️ 后台管理</a>
              <form onSubmit={(e) => { handleSearch(e); setMenuOpen(false); }} className="flex pt-2">
                <input name="q" type="text" placeholder="搜索..." className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-l-lg text-sm text-slate-200 focus:outline-none" />
                <button type="submit" className="px-4 py-1.5 bg-cyan-600 text-white rounded-r-lg text-sm">搜索</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
