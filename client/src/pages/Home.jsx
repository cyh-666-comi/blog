import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    articlesAPI.getList({ pageSize: 50 })
      .then(res => setArticles(res.data))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-7 w-7 border-2 border-coral-200 border-t-coral-400"></div></div>
  );

  return (
    <div>
      {/* 顶部装饰 */}
      <div className="text-center mb-8 relative">
        <span className="absolute left-0 top-0 text-3xl animate-float select-none pointer-events-none">🌸</span>
        <span className="absolute right-0 top-0 text-3xl animate-float-delay select-none pointer-events-none">🦴</span>
        <p className="text-5xl mb-2 animate-heartbeat inline-block">🐕</p>
        <h1 className="text-xl font-bold text-brown-800">线条小狗日记</h1>
        <p className="text-brown-400 text-sm mt-1">
          👋 欢迎你，<span className="text-coral-500 font-medium">{user?.username}</span>！
        </p>
        <div className="cute-divider">🐾 💕 🐾</div>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 text-brown-400 bg-white rounded-3xl shadow-card border border-warm-200">
          <p className="text-6xl mb-4 animate-wobble inline-block">📖</p>
          <p className="text-lg">还没有日记呢~</p>
          <p className="text-sm mt-2">快来写第一篇吧！✍️</p>
        </div>
      ) : (
        <div className="space-y-5">
          {articles.map((a, i) => (
            <Link key={a.id} to={`/diary/${a.slug}`}
              className="block bg-white rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-warm-200 hover:-translate-y-1 hover:border-coral-200/50 p-6 relative overflow-hidden group">
              {/* 卡片装饰角标 */}
              <span className="absolute top-3 right-4 text-lg opacity-30 group-hover:opacity-60 transition select-none pointer-events-none">
                {i === 0 ? '💕' : i === 1 ? '🌸' : '🐾'}
              </span>
              {a.cover_image && (
                <img src={a.cover_image} alt={a.title} className="w-full h-48 object-cover rounded-2xl mb-4 border border-warm-100" />
              )}
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-coral-400"></span>
                <h2 className="text-xl font-semibold text-brown-800 group-hover:text-coral-500 transition">{a.title}</h2>
              </div>
              {a.summary && <p className="text-brown-400 text-sm line-clamp-3 leading-relaxed">{a.summary}</p>}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-dashed border-warm-200 text-xs text-brown-300">
                <div className="flex items-center gap-3">
                  <span className="text-brown-400 font-medium">✍️ {a.author?.username}</span>
                  <span>📅 {new Date(a.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>👀 {a.view_count}</span>
                  <span>💬 {a.comment_count}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
