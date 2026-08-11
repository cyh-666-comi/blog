import { useState, useEffect } from 'react';
import { commentsAPI } from '../../api/client';
import Pagination from '../../components/Pagination';

export default function Comments() {
  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetch = (page = 1) => {
    setLoading(true);
    commentsAPI.getAll({ page, pageSize: 15, status: statusFilter || undefined })
      .then(res => { setComments(res.data); setPagination(res.pagination); })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [statusFilter]);

  const handleModerate = async (id, status) => {
    try { await commentsAPI.moderate(id, { status }); fetch(pagination.page); } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定删除这条留言吗？')) return;
    try { await commentsAPI.delete(id); fetch(pagination.page); } catch (err) { alert(err.message); }
  };

  const fb = (v, l) => (
    <button onClick={() => setStatusFilter(v)}
      className={`px-3 py-1.5 text-sm rounded-full transition border ${statusFilter === v ? 'bg-coral-50 text-coral-500 border-coral-200' : 'text-brown-400 border-warm-200 hover:border-coral-300'}`}>{l}</button>
  );

  const badge = (s) => {
    const m = { approved: 'bg-emerald-50 text-emerald-500', pending: 'bg-amber-50 text-amber-500', rejected: 'bg-red-50 text-red-500' };
    const l = { approved: '通过', pending: '待审', rejected: '拒绝' };
    return <span className={`text-xs px-2 py-0.5 rounded-full ${m[s] || ''}`}>{l[s] || s}</span>;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-brown-800 mb-6">💬 留言管理</h1>

      <div className="flex gap-2 mb-4">{fb('', '全部')}{fb('approved', '已通过')}{fb('pending', '待审核')}{fb('rejected', '已拒绝')}</div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-7 w-7 border-2 border-coral-200 border-t-coral-400"></div></div>
      ) : comments.length === 0 ? (
        <div className="text-center py-20 text-brown-400 bg-white rounded-2xl shadow-card border border-warm-200">暂无留言</div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-warm-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-brown-400 bg-warm-50 border-b border-warm-200">
                  <th className="py-3 px-4 font-medium">内容</th><th className="py-3 px-4 font-medium w-20">作者</th><th className="py-3 px-4 font-medium w-28">日记</th><th className="py-3 px-4 font-medium w-16">状态</th><th className="py-3 px-4 font-medium w-28">时间</th><th className="py-3 px-4 font-medium w-40">操作</th>
                </tr>
              </thead>
              <tbody>
                {comments.map(c => (
                  <tr key={c.id} className="border-b border-warm-100 last:border-0 hover:bg-coral-50/30 transition">
                    <td className="py-3 px-4"><span className="text-brown-600 line-clamp-2">{c.content}</span></td>
                    <td className="py-3 px-4 text-brown-500">{c.author_display}</td>
                    <td className="py-3 px-4 text-brown-400 text-xs line-clamp-1">{c.article_title}</td>
                    <td className="py-3 px-4">{badge(c.status)}</td>
                    <td className="py-3 px-4 text-brown-400 text-xs">{new Date(c.created_at).toLocaleString('zh-CN')}</td>
                    <td className="py-3 px-4">
                      {c.status !== 'approved' && <button onClick={() => handleModerate(c.id, 'approved')} className="text-xs text-emerald-500 hover:underline px-1">通过</button>}
                      {c.status !== 'rejected' && <button onClick={() => handleModerate(c.id, 'rejected')} className="text-xs text-amber-500 hover:underline px-1">拒绝</button>}
                      <button onClick={() => handleDelete(c.id)} className="text-xs text-brown-300 hover:text-red-400 px-1 transition">删除</button>
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
