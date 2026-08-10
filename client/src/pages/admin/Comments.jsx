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
    if (!confirm('确定要删除这条评论吗？')) return;
    try { await commentsAPI.delete(id); fetch(pagination.page); } catch (err) { alert(err.message); }
  };

  const filterBtn = (v, label) => (
    <button onClick={() => setStatusFilter(v)}
      className={`px-3 py-1.5 text-sm rounded-lg transition font-medium ${
        statusFilter === v ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-600'
      }`}>{label}</button>
  );

  const statusBadge = (s) => {
    const m = { approved: 'bg-emerald-500/10 text-emerald-400', pending: 'bg-amber-500/10 text-amber-400', rejected: 'bg-red-500/10 text-red-400' };
    const l = { approved: '通过', pending: '待审', rejected: '拒绝' };
    return <span className={`text-xs px-2 py-0.5 rounded-full ${m[s] || ''}`}>{l[s] || s}</span>;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-100 mb-6">💬 评论管理</h1>

      <div className="flex gap-2 mb-4">
        {filterBtn('', '全部')}{filterBtn('approved', '已通过')}{filterBtn('pending', '待审核')}{filterBtn('rejected', '已拒绝')}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-7 w-7 border-2 border-slate-700 border-t-cyan-500"></div></div>
      ) : comments.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">暂无评论</div>
      ) : (
        <>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 bg-slate-900 border-b border-slate-800">
                  <th className="py-3 px-4 font-medium">内容</th><th className="py-3 px-4 font-medium w-24">作者</th><th className="py-3 px-4 font-medium w-32">文章</th><th className="py-3 px-4 font-medium w-20">状态</th><th className="py-3 px-4 font-medium w-28">时间</th><th className="py-3 px-4 font-medium w-40">操作</th>
                </tr>
              </thead>
              <tbody>
                {comments.map(c => (
                  <tr key={c.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4"><span className="text-slate-300 line-clamp-2">{c.content}</span></td>
                    <td className="py-3 px-4 text-slate-500">{c.author_display}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs line-clamp-1">{c.article_title}</td>
                    <td className="py-3 px-4">{statusBadge(c.status)}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{new Date(c.created_at).toLocaleString('zh-CN')}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {c.status !== 'approved' && <button onClick={() => handleModerate(c.id, 'approved')} className="text-xs text-emerald-400 hover:underline px-1">通过</button>}
                        {c.status !== 'rejected' && <button onClick={() => handleModerate(c.id, 'rejected')} className="text-xs text-amber-400 hover:underline px-1">拒绝</button>}
                        <button onClick={() => handleDelete(c.id)} className="text-xs text-slate-500 hover:text-red-400 px-1 transition">删除</button>
                      </div>
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
