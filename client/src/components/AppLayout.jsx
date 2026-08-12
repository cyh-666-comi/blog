import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { user, isUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) { navigate('/'); return null; }

  return (
    <div className="min-h-screen">
      {/* 顶栏 */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b-2 border-dashed border-warm-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link to="/home" className="flex items-center gap-1.5 text-lg font-bold text-coral-500 hover:text-coral-400 transition">
              <span className="animate-wobble inline-block text-xl">🐕</span>
              <span className="hidden sm:inline">线条小狗日记</span>
            </Link>
            <span className="text-warm-300 hidden sm:inline">|</span>
            <Link to="/home" className="text-sm text-brown-500 hover:text-coral-500 transition font-medium">📖 日记</Link>
            <Link to="/messages" className="text-sm text-brown-500 hover:text-coral-500 transition font-medium">💬 留言</Link>
            {isUser && (
              <Link to="/admin/diaries/new" className="text-sm bg-coral-400 text-white px-3 py-1 rounded-full hover:bg-coral-500 transition shadow-sm">✍️ 写日记</Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-brown-400 bg-warm-100 px-3 py-1.5 rounded-full border border-warm-200">
              {isUser ? '🐾' : '🌸'} {user.username}
            </span>
            <button onClick={() => { logout(); navigate('/'); }}
              className="text-xs text-brown-300 hover:text-coral-500 transition">退出</button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-6 relative">
        <Outlet />
      </main>

      {/* 底部装饰 */}
      <div className="text-center py-8 text-brown-300 text-xs space-x-4">
        <span className="inline-block animate-float">🐾</span>
        <span className="inline-block animate-float-delay">💕</span>
        <span className="inline-block animate-float-slow">🌸</span>
      </div>
    </div>
  );
}
