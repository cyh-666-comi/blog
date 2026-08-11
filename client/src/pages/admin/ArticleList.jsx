import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesAPI } from '../../api/client';
import Pagination from '../../components/Pagination';

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetch = (page = 1) => {
    setLoading(true);
    articlesAPI.getAll({ page, pageSize: 10, status: statusFilter || undefined })
      .then(res => { setArticles(res.data); setPagination(res.pagination); })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [statusFilter]);

  const handleDelete = async (id, title) => {
    if (!confirm(`确定删除「${title}」吗？`)) return;
    try { await articlesAPI.delete(id); fetch(pagination.page); }
    catch (err) { alert(err.message); }
  };

  const fb = (v, l) => (
    <button onClick={() => setStatusFilter(v)}
      className={`px-3 py-1.5 text-sm rounded-full transition border ${statusFilter === v ? 'bg-coral-50 text-coral-500 border-coral-200' : 'text-brown-400 border-warm-200 hover:border-coral-300'}`}>{l}</button>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brown-800">📖 日记列表</h1>
        <Link to="/admin/articles/new" className="px-5 py-2 bg-coral-400 text-white rounded-full text-sm hover:bg-coral-500 transition font-medium shadow-md shadow-coral-200">✍️ 写日记</Link>
      </div>

      <div className="flex gap-2 mb-4">{fb('', '全部')}{fb('published', '已发布')}{fb('draft', '草稿')}</div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-7 w-7 border-2 border-coral-200 border-t-coral-400"></div></div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-brown-400 bg-white rounded-3xl shadow-card border border-warm-200">📖 暂无日记</div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-warm-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-brown-400 bg-warm-50 border-b border-warm-200">
                  <th className="py-3 px-4 font-medium">标题</th><th className="py-3 px-4 font-medium w-20">状态</th><th className="py-3 px-4 font-medium w-24">分类</th><th className="py-3 px-4 font-medium w-28">时间</th><th className="py-3 px-4 font-medium w-20">浏览</th><th className="py-3 px-4 font-medium w-36">操作</th>
                </tr>
              </thead>
              <tbody>
                {articles.map(a => (
                  <tr key={a.id} className="border-b border-warm-100 last:border-0 hover:bg-coral-50/30 transition">
                    <td className="py-3 px-4"><span className="text-brown-700 line-clamp-1 font-medium">{a.title}</span></td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === 'published' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                        {a.status === 'published' ? '已发布' : '草稿'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-brown-400">{a.category?.name || '-'}</td>
                    <td className="py-3 px-4 text-brown-400 text-xs">{new Date(a.created_at).toLocaleDateString('zh-CN')}</td>
                    <td className="py-3 px-4 text-brown-400">{a.view_count}</td>
                    <td className="py-3 px-4">
                      <Link to={`/article/${a.slug}`} target="_blank" className="text-xs text-brown-400 hover:text-coral-500 transition mr-2">查看</Link>
                      <Link to={`/admin/articles/${a.id}/edit`} className="text-xs text-coral-500 hover:underline mr-2">编辑</Link>
                      <button onClick={() => handleDelete(a.id, a.title)} className="text-xs text-brown-300 hover:text-red-400 transition">删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={fetch} />
        </>
      )}
    </div>
  );
}
