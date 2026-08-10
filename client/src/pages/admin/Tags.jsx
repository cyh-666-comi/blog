import { useState, useEffect } from 'react';
import { tagsAPI } from '../../api/client';

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [form, setForm] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);
  const [batchInput, setBatchInput] = useState('');
  const [loading, setLoading] = useState(true);

  const fetch = () => tagsAPI.getList().then(res => setTags(res.data)).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('请输入标签名称');
    try { editingId ? await tagsAPI.update(editingId, form) : await tagsAPI.create(form); setForm({ name: '' }); setEditingId(null); fetch(); }
    catch (err) { alert(err.message); }
  };

  const handleBatch = async () => {
    const names = batchInput.split(/[,，\s]+/).filter(Boolean);
    if (names.length === 0) return alert('请输入标签名');
    try { await tagsAPI.createBatch({ names }); setBatchInput(''); fetch(); }
    catch (err) { alert(err.message); }
  };

  const handleDelete = async (tag) => {
    if (!confirm(`确定要删除标签"${tag.name}"吗？`)) return;
    try { await tagsAPI.delete(tag.id); fetch(); } catch (err) { alert(err.message); }
  };

  const inp = "flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-100 mb-6">🏷️ 标签管理</h1>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4">
        <h3 className="font-medium text-slate-200 mb-3">{editingId ? '编辑标签' : '新建标签'}</h3>
        <div className="flex gap-3">
          <input type="text" value={form.name} onChange={e => setForm({ name: e.target.value })} placeholder="标签名称" className={inp} />
          <button type="submit" className="px-5 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition text-sm font-medium">{editingId ? '更新' : '创建'}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '' }); }} className="px-4 py-2 border border-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition text-sm">取消</button>}
        </div>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
        <h3 className="font-medium text-slate-200 mb-3">批量创建标签</h3>
        <div className="flex gap-3">
          <input type="text" value={batchInput} onChange={e => setBatchInput(e.target.value)} placeholder="用逗号或空格分隔" className={inp} />
          <button onClick={handleBatch} className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition text-sm font-medium">批量创建</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-7 w-7 border-2 border-slate-700 border-t-cyan-500"></div></div>
      ) : tags.length === 0 ? (
        <div className="text-center py-10 text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">暂无标签</div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex flex-wrap gap-3">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full pl-3 pr-1 py-1">
                <span className="text-sm text-slate-300">{tag.name}</span>
                <span className="text-xs text-slate-600">({tag.article_count})</span>
                <button onClick={() => { setEditingId(tag.id); setForm({ name: tag.name }); }} className="text-xs text-cyan-400 hover:underline px-2">编辑</button>
                <button onClick={() => handleDelete(tag)} className="text-xs text-slate-500 hover:text-red-400 pr-2 transition">×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
