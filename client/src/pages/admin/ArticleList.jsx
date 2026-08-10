import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesAPI } from '../../api/client';
import Pagination from '../../components/Pagination';

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchArticles = (page = 1) => {
    setLoading(true);
    articlesAPI.getAll({ page, pageSize: 10, status: statusFilter || undefined })
      .then(res => { setArticles(res.data); setPagination(res.pagination); })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchArticles(); }, [statusFilter]);

  const handleDelete = async (id, title) => {
    if (!confirm(`确定要删除文章「${title}」吗？此操作不可恢复。`)) return;
    try { await articlesAPI.delete(id); fetchArticles(pagination.page); }
    catch (err) { alert(err.message); }
  };

  const filterBtn = (v, label) => (
    <button onClick={() => setStatusFilter(v)}
      className={`px-3 py-1.5 text-sm rounded-lg transition font-medium ${
        statusFilter === v ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-600'
      }`}>{label}</button>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">📄 文章管理</h1>
        <Link to="/admin/articles/new" className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-500 transition font-medium">✏️ 写文章</Link>
      </div>

      <div className="flex gap-2 mb-4">
        {filterBtn('', '全部')}{filterBtn('published', '已发布')}{filterBtn('draft', '草稿')}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-7 w-7 border-2 border-slate-700 border-t-cyan-500"></div></div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-slate-900 border border-slate-800 rounded-xl"><p className="text-4xl mb-2">📝</p><p>暂无文章</p></div>
      ) : (
        <>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 bg-slate-900 border-b border-slate-800">
                  <th className="py-3 px-4 font-medium">标题</th><th className="py-3 px-4 font-medium w-20">状态</th><th className="py-3 px-4 font-medium w-24">分类</th><th className="py-3 px-4 font-medium w-28">发布时间</th><th className="py-3 px-4 font-medium w-20">浏览</th><th className="py-3 px-4 font-medium w-36">操作</th>
                </tr>
              </thead>
              <tbody>
                {articles.map(article => (
                  <tr key={article.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4"><span className="text-slate-200 line-clamp-1 font-medium">{article.title}</span></td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${article.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {article.status === 'published' ? '已发布' : '草稿'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{article.category?.name || '-'}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{new Date(article.created_at).toLocaleDateString('zh-CN')}</td>
                    <td className="py-3 px-4 text-slate-500">{article.view_count}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/article/${article.slug}`} target="_blank" className="text-xs text-slate-500 hover:text-cyan-400 transition">查看</Link>
                        <Link to={`/admin/articles/${article.id}/edit`} className="text-xs text-cyan-400 hover:underline">编辑</Link>
                        <button onClick={() => handleDelete(article.id, article.title)} className="text-xs text-slate-500 hover:text-red-400 transition">删除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchArticles} />
        </>
      )}
    </div>
  );
}
