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
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(username, password); navigate('/admin'); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50">
      <div className="bg-white rounded-3xl shadow-soft-lg p-8 w-full max-w-sm border border-warm-200">
        <div className="text-center mb-6">
          <p className="text-5xl mb-3">🐕</p>
          <h1 className="text-2xl font-bold text-brown-800">写日记啦~</h1>
          <p className="text-brown-400 text-xs mt-1">我们的恋爱日记</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-500 text-sm p-3 rounded-2xl mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brown-500 mb-1">昵称</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 bg-warm-50 border border-warm-200 rounded-2xl text-brown-700 placeholder-brown-300 focus:outline-none focus:border-coral-300 transition"
              placeholder="cyh 或 frz" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-500 mb-1">密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-warm-50 border border-warm-200 rounded-2xl text-brown-700 placeholder-brown-300 focus:outline-none focus:border-coral-300 transition"
              placeholder="••••••" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-coral-400 text-white rounded-2xl hover:bg-coral-500 disabled:opacity-50 transition font-medium shadow-md shadow-coral-200 text-lg">
            {loading ? '正在进入...' : '🐾 进入'}
          </button>
        </form>
      </div>
    </div>
  );
}
