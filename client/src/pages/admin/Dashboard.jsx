import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesAPI, categoriesAPI, tagsAPI, commentsAPI } from '../../api/client';

const statDefs = [
  { label: '文章总数', key: 'articles', link: '/admin/articles', accent: 'bg-blue-500' },
  { label: '草稿', key: 'drafts', link: '/admin/articles', accent: 'bg-amber-500' },
  { label: '分类', key: 'categories', link: '/admin/categories', accent: 'bg-emerald-500' },
  { label: '标签', key: 'tags', link: '/admin/tags', accent: 'bg-purple-500' },
  { label: '评论', key: 'comments', link: '/admin/comments', accent: 'bg-pink-500' },
];

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
      setStats({
        articles: a.pagination.total, drafts: d.pagination.total,
        categories: c.data.length, tags: t.data.length, comments: cm.pagination.total,
      });
      setRecentArticles(a.data.slice(0, 5));
    }).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-100 mb-6">📊 仪表盘</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statDefs.map(card => (
          <Link key={card.key} to={card.link} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/30 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-2 h-2 rounded-full ${card.accent}`}></div>
              <p className="text-3xl font-bold text-white">{stats[card.key]}</p>
            </div>
            <p className="text-sm text-slate-400">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-200">📝 最近文章</h2>
          <Link to="/admin/articles/new" className="px-4 py-1.5 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-500 transition font-medium">写文章</Link>
        </div>
        {recentArticles.length === 0 ? (
          <p className="text-slate-500 text-sm py-8 text-center">暂无文章，快去写第一篇吧！</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-800">
                <th className="pb-3 font-medium">标题</th>
                <th className="pb-3 font-medium">状态</th>
                <th className="pb-3 font-medium">发布时间</th>
                <th className="pb-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {recentArticles.map(article => (
                <tr key={article.id} className="border-b border-slate-800/50 last:border-0">
                  <td className="py-3 pr-4"><span className="text-slate-200 line-clamp-1">{article.title}</span></td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      article.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {article.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">{new Date(article.created_at).toLocaleDateString('zh-CN')}</td>
                  <td className="py-3">
                    <Link to={`/admin/articles/${article.id}/edit`} className="text-cyan-400 hover:underline text-sm">编辑</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
