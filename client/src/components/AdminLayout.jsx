import { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const sidebarLinks = [
  { path: '/admin', label: '📊 仪表盘' },
  { path: '/admin/articles', label: '📄 文章管理' },
  { path: '/admin/articles/new', label: '✏️ 写文章' },
  { path: '/admin/categories', label: '📁 分类管理' },
  { path: '/admin/tags', label: '🏷️ 标签管理' },
  { path: '/admin/comments', label: '💬 评论管理' },
];

export default function AdminLayout() {
  const { user, loading, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/admin/login');
  }, [loading, isAdmin, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="animate-spin rounded-full h-7 w-7 border-2 border-slate-700 border-t-cyan-500"></div>
    </div>
  );

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex bg-slate-950">
      <aside className="w-64 bg-slate-900 flex flex-col border-r border-slate-800">
        <div className="p-5 border-b border-slate-800">
          <Link to="/admin" className="text-lg font-bold text-cyan-400 tracking-wide">◈ 博客后台</Link>
          <p className="text-slate-500 text-sm mt-1">{user?.username}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarLinks.map(link => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  active
                    ? 'bg-cyan-500/10 text-cyan-400 font-medium border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <Link to="/" className="block px-3 py-2 text-sm text-slate-500 hover:text-cyan-400 transition" target="_blank">🌐 查看网站</Link>
          <button onClick={() => { logout(); navigate('/admin/login'); }}
            className="block w-full text-left px-3 py-2 text-sm text-slate-500 hover:text-red-400 transition">🚪 退出登录</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-6xl"><Outlet /></div>
      </main>
    </div>
  );
}
