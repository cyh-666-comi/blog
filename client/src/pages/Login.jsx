import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGuest, setShowGuest] = useState(false);
  const { login, loginAsGuest, user } = useAuth();
  const navigate = useNavigate();

  // 已登录用户重定向
  if (user) { navigate('/home'); return null; }

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(username, password); navigate('/home'); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleGuest = (e) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    loginAsGuest(guestName.trim());
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* 浮动装饰 */}
      <span className="absolute top-[10%] left-[8%] text-4xl animate-float select-none pointer-events-none">🦴</span>
      <span className="absolute top-[20%] right-[10%] text-3xl animate-float-delay select-none pointer-events-none">💕</span>
      <span className="absolute bottom-[25%] left-[12%] text-2xl animate-float-slow select-none pointer-events-none">🐾</span>
      <span className="absolute bottom-[15%] right-[8%] text-3xl animate-float select-none pointer-events-none">🌸</span>
      <span className="absolute top-[40%] left-[5%] text-2xl animate-sparkle select-none pointer-events-none">✨</span>
      <span className="absolute top-[55%] right-[6%] text-3xl animate-sparkle select-none pointer-events-none" style={{animationDelay:'1.5s'}}>✨</span>
      <span className="absolute bottom-[40%] left-[85%] text-4xl animate-wobble select-none pointer-events-none">🐕</span>
      <span className="absolute top-[8%] left-[75%] text-2xl animate-float-delay select-none pointer-events-none">🎀</span>

      <div className="bg-white/90 backdrop-blur rounded-3xl shadow-soft-lg p-8 w-full max-w-sm border border-warm-200 relative z-10">
        <div className="text-center mb-8">
          <p className="text-6xl mb-4 animate-heartbeat">🐕</p>
          <h1 className="text-2xl font-bold text-brown-800">线条小狗日记</h1>
          <div className="flex justify-center gap-1 mt-2 text-sm">
            <span>🐾</span><span>💕</span><span>🐾</span><span>💕</span><span>🐾</span>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-500 text-sm p-3 rounded-2xl mb-4 text-center">{error}</div>}

        {!showGuest ? (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown-500 mb-1">昵称</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-2xl text-brown-700 placeholder-brown-300 focus:outline-none focus:border-coral-300 transition text-center"
                  placeholder="请输入昵称" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-500 mb-1">密码</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-2xl text-brown-700 placeholder-brown-300 focus:outline-none focus:border-coral-300 transition text-center"
                  placeholder="••••••" required />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-coral-400 text-white rounded-2xl hover:bg-coral-500 disabled:opacity-50 transition font-medium shadow-md shadow-coral-200 text-lg">
                {loading ? '进入中...' : '🐾 登录'}
              </button>
            </form>
            <div className="mt-4 text-center">
              <button onClick={() => setShowGuest(true)}
                className="text-brown-400 hover:text-coral-500 transition text-sm underline underline-offset-4">
                我只是来看看 👀
              </button>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleGuest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown-500 mb-1">你的昵称</label>
                <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)}
                  className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-2xl text-brown-700 placeholder-brown-300 focus:outline-none focus:border-coral-300 transition text-center"
                  placeholder="怎么称呼你？" required />
              </div>
              <button type="submit"
                className="w-full py-3 bg-warm-300 text-white rounded-2xl hover:bg-warm-400 transition font-medium shadow-md shadow-warm-200 text-lg">
                🌸 游客进入
              </button>
            </form>
            <div className="mt-4 text-center">
              <button onClick={() => setShowGuest(false)}
                className="text-brown-400 hover:text-coral-500 transition text-sm underline underline-offset-4">
                返回登录
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
