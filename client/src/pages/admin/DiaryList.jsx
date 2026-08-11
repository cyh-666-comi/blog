import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function DiaryList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isUser } = useAuth();

  const fetch = () => {
    setLoading(true);
    articlesAPI.getAll({ pageSize: 50 })
      .then(res => setArticles(res.data))
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`确定删除「${title}」吗？`)) return;
    try { await articlesAPI.delete(id); fetch(); }
    catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brown-800">📖 日记管理</h1>
        {isUser && (
          <Link to="/admin/diaries/new" className="px-5 py-2 bg-coral-400 text-white rounded-full text-sm hover:bg-coral-500 transition shadow-md shadow-coral-200">✍️ 写日记</Link>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-7 w-7 border-2 border-coral-200 border-t-coral-400"></div></div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-brown-400 bg-white rounded-3xl shadow-card border border-warm-200">📖 还没有日记</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-warm-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-brown-400 bg-warm-50 border-b border-warm-200">
                <th className="py-3 px-4 font-medium">标题</th><th className="py-3 px-4 font-medium w-20">状态</th><th className="py-3 px-4 font-medium w-24">作者</th><th className="py-3 px-4 font-medium w-28">时间</th><th className="py-3 px-4 font-medium w-28">操作</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(a => (
                <tr key={a.id} className="border-b border-warm-100 last:border-0 hover:bg-coral-50/30">
                  <td className="py-3 px-4"><span className="text-brown-700 line-clamp-1 font-medium">{a.title}</span></td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === 'published' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                      {a.status === 'published' ? '发布' : '草稿'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-brown-500">{a.author?.username}</td>
                  <td className="py-3 px-4 text-brown-400 text-xs">{new Date(a.created_at).toLocaleDateString('zh-CN')}</td>
                  <td className="py-3 px-4">
                    <Link to={`/diary/${a.slug}`} className="text-xs text-brown-400 hover:text-coral-500 mr-2">看</Link>
                    <Link to={`/admin/diaries/${a.id}/edit`} className="text-xs text-coral-500 hover:underline mr-2">改</Link>
                    <button onClick={() => handleDelete(a.id, a.title)} className="text-xs text-brown-300 hover:text-red-400">删</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
