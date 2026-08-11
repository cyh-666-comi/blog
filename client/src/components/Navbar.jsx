import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI } from '../api/client';

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    categoriesAPI.getList().then(res => setCategories(res.data)).catch(() => {});
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b-2 border-dashed border-warm-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-coral-500 hover:text-coral-400 transition">
            <span className="text-2xl">🐕</span>
            <span>我们的恋爱日记</span>
            <span className="text-sm font-normal text-brown-400 hidden sm:inline">cyh ♥ frz</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-brown-500 hover:text-coral-500 transition text-sm font-medium">🏠 首页</Link>
            {categories.slice(0, 4).map(cat => (
              <Link key={cat.id} to={`/category/${cat.slug}`} className="text-brown-400 hover:text-coral-500 transition text-sm">
                {cat.name}
              </Link>
            ))}
          </div>

          <a href="/admin" className="hidden md:block text-brown-300 hover:text-coral-500 transition text-sm" title="写日记">
            ✍️ 写日记
          </a>

          <button className="md:hidden p-2 text-brown-400" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t-2 border-dashed border-warm-200">
            <div className="flex flex-col space-y-2 pt-3">
              <Link to="/" className="text-brown-500 py-1" onClick={() => setMenuOpen(false)}>🏠 首页</Link>
              {categories.map(cat => (
                <Link key={cat.id} to={`/category/${cat.slug}`} className="text-brown-400 py-1 text-sm" onClick={() => setMenuOpen(false)}>
                  {cat.name}
                </Link>
              ))}
              <a href="/admin" className="text-coral-400 py-1 text-sm" onClick={() => setMenuOpen(false)}>✍️ 写日记</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
