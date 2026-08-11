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
      <div className="text-center mb-8">
        <p className="text-5xl mb-2">🐕</p>
        <h1 className="text-xl font-bold text-brown-800">线条小狗日记</h1>
        <p className="text-brown-400 text-sm mt-1">👋 欢迎你，{user?.username}！</p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 text-brown-400 bg-white rounded-3xl shadow-card border border-warm-200">
          <p className="text-5xl mb-4">📖</p>
          <p>还没有日记呢~</p>
        </div>
      ) : (
        <div className="space-y-5">
          {articles.map(a => (
            <Link key={a.id} to={`/diary/${a.slug}`} className="block bg-white rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-warm-200 hover:-translate-y-1 p-6">
              {a.cover_image && (
                <img src={a.cover_image} alt={a.title} className="w-full h-48 object-cover rounded-2xl mb-4 border border-warm-100" />
              )}
              <h2 className="text-xl font-semibold text-brown-800 mb-2 hover:text-coral-500 transition">{a.title}</h2>
              {a.summary && <p className="text-brown-400 text-sm line-clamp-3 leading-relaxed">{a.summary}</p>}
              <div className="flex items-center justify-between mt-4 text-xs text-brown-300">
                <div className="flex items-center gap-3">
                  <span className="text-brown-400 font-medium">✍️ {a.author?.username}</span>
                  <span>{new Date(a.created_at).toLocaleDateString('zh-CN')}</span>
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
