import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesAPI, categoriesAPI, tagsAPI, commentsAPI } from '../../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState({ articles: 0, categories: 0, tags: 0, comments: 0, drafts: 0 });
  const [recentArticles, setRecentArticles] = useState([]);

  useEffect(() => {
    Promise.all([
      articlesAPI.getAll({ pageSize: 5 }),
      articlesAPI.getAll({ status: 'draft', pageSize: 1 }),
      categoriesAPI.getList(),
      tagsAPI.getList(),
      commentsAPI.getAll({ pageSize: 1 }),
    ]).then(([a, d, c, t, cm]) => {
      setStats({ articles: a.pagination.total, drafts: d.pagination.total, categories: c.data.length, tags: t.data.length, comments: cm.pagination.total });
      setRecentArticles(a.data.slice(0, 5));
    }).catch(console.error);
  }, []);

  const cards = [
    { label: '日记总数', val: stats.articles, link: '/admin/articles', emoji: '📖', color: 'bg-coral-50 border-coral-200 text-coral-500' },
    { label: '草稿', val: stats.drafts, link: '/admin/articles', emoji: '📝', color: 'bg-amber-50 border-amber-200 text-amber-500' },
    { label: '分类', val: stats.categories, link: '/admin/categories', emoji: '📂', color: 'bg-emerald-50 border-emerald-200 text-emerald-500' },
    { label: '标签', val: stats.tags, link: '/admin/tags', emoji: '🏷️', color: 'bg-purple-50 border-purple-200 text-purple-500' },
    { label: '留言', val: stats.comments, link: '/admin/comments', emoji: '💬', color: 'bg-pink-50 border-pink-200 text-pink-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brown-800 mb-6">🏠 仪表盘</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map(c => (
          <Link key={c.label} to={c.link} className={`${c.color} border rounded-2xl p-5 hover:shadow-md transition`}>
            <p className="text-2xl mb-1">{c.emoji}</p>
            <p className="text-3xl font-bold">{c.val}</p>
            <p className="text-sm mt-1 opacity-70">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-card p-5 border border-warm-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-brown-800">📖 最近日记</h2>
          <Link to="/admin/articles/new" className="px-5 py-2 bg-coral-400 text-white rounded-full text-sm hover:bg-coral-500 transition font-medium shadow-md shadow-coral-200">✍️ 写日记</Link>
        </div>
        {recentArticles.length === 0 ? (
          <p className="text-brown-400 text-sm py-8 text-center">还没有日记，快去写第一篇吧~ 🐾</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-brown-400 border-b-2 border-dashed border-warm-200">
                <th className="pb-3 font-medium">标题</th><th className="pb-3 font-medium">状态</th><th className="pb-3 font-medium">时间</th><th className="pb-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {recentArticles.map(a => (
                <tr key={a.id} className="border-b border-warm-100 last:border-0">
                  <td className="py-3 pr-4"><span className="text-brown-700 line-clamp-1">{a.title}</span></td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === 'published' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                      {a.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="py-3 text-brown-400">{new Date(a.created_at).toLocaleDateString('zh-CN')}</td>
                  <td className="py-3"><Link to={`/admin/articles/${a.id}/edit`} className="text-coral-500 hover:underline text-sm">编辑</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
