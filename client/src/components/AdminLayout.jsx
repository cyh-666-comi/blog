import { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const sidebarLinks = [
  { path: '/admin', label: '🏠 仪表盘' },
  { path: '/admin/articles', label: '📖 日记列表' },
  { path: '/admin/articles/new', label: '✍️ 写日记' },
  { path: '/admin/categories', label: '📂 分类' },
  { path: '/admin/tags', label: '🏷️ 标签' },
  { path: '/admin/comments', label: '💬 留言' },
];

export default function AdminLayout() {
  const { user, loading, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/admin/login');
  }, [loading, isAdmin, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50">
      <div className="animate-spin rounded-full h-7 w-7 border-2 border-coral-200 border-t-coral-400"></div>
    </div>
  );

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex bg-warm-50">
      <aside className="w-60 bg-white flex flex-col border-r-2 border-dashed border-warm-200">
        <div className="p-5 border-b-2 border-dashed border-warm-200">
          <Link to="/admin" className="text-lg font-bold text-coral-500">
            🐕 恋爱日记
          </Link>
          <p className="text-brown-400 text-sm mt-1">👤 {user?.username}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarLinks.map(link => {
            const active = location.pathname === link.path;
            return (
              <Link key={link.path} to={link.path}
                className={`block px-4 py-2.5 rounded-2xl text-sm transition-all ${
                  active ? 'bg-coral-50 text-coral-500 font-medium border border-coral-200' : 'text-brown-500 hover:bg-warm-50 hover:text-coral-500'
                }`}>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t-2 border-dashed border-warm-200">
          <Link to="/" className="block px-3 py-2 text-sm text-brown-400 hover:text-coral-500 transition" target="_blank">🌐 看日记</Link>
          <button onClick={() => { logout(); navigate('/admin/login'); }}
            className="block w-full text-left px-3 py-2 text-sm text-brown-400 hover:text-red-400 transition">🚪 退出</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-6xl"><Outlet /></div>
      </main>
    </div>
  );
}
