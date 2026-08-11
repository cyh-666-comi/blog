import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { user, isUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) { navigate('/'); return null; }

  return (
    <div className="min-h-screen bg-warm-50">
      {/* 顶栏 */}
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur border-b-2 border-dashed border-warm-200">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link to="/home" className="flex items-center gap-1.5 text-lg font-bold text-coral-500 hover:text-coral-400 transition">
              <span>🐕</span><span className="hidden sm:inline">线条小狗日记</span>
            </Link>
            <Link to="/home" className="text-sm text-brown-500 hover:text-coral-500 transition">📖 日记</Link>
            <Link to="/messages" className="text-sm text-brown-500 hover:text-coral-500 transition">💬 留言板</Link>
            {isUser && (
              <Link to="/admin/diaries/new" className="text-sm text-coral-500 hover:text-coral-400 transition font-medium">✍️ 写日记</Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-brown-400 bg-warm-100 px-3 py-1 rounded-full">
              {isUser ? '👤' : '🌸'} {user.username}
            </span>
            <button onClick={() => { logout(); navigate('/'); }}
              className="text-xs text-brown-400 hover:text-coral-500 transition">退出</button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
