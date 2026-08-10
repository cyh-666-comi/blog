import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (isAdmin) { navigate('/admin'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { await login(username, password); navigate('/admin'); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-sm shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-cyan-400 mb-1">◈ 后台登录</h1>
          <p className="text-slate-500 text-xs">博客管理系统</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">用户名</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition"
              placeholder="admin" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition"
              placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 transition font-medium">
            {loading ? '登录中...' : '◈ 登录'}
          </button>
        </form>
        <p className="text-xs text-slate-600 text-center mt-4">默认账号: admin / admin123</p>
      </div>
    </div>
  );
}
