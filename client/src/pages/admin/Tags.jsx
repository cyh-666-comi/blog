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

  const handleDelete = async (t) => {
    if (!confirm(`确定删除「${t.name}」吗？`)) return;
    try { await tagsAPI.delete(t.id); fetch(); } catch (err) { alert(err.message); }
  };

  const inp = "flex-1 px-4 py-2.5 bg-warm-50 border border-warm-200 rounded-2xl text-brown-700 placeholder-brown-300 focus:outline-none focus:border-coral-300 transition";

  return (
    <div>
      <h1 className="text-2xl font-bold text-brown-800 mb-6">🏷️ 标签管理</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-5 mb-4 border border-warm-200">
        <h3 className="font-medium text-brown-700 mb-3">{editingId ? '编辑标签' : '新建标签'}</h3>
        <div className="flex gap-3">
          <input type="text" value={form.name} onChange={e => setForm({ name: e.target.value })} placeholder="标签名称" className={inp} />
          <button type="submit" className="px-5 py-2.5 bg-coral-400 text-white rounded-full hover:bg-coral-500 transition text-sm font-medium">{editingId ? '更新' : '创建'}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '' }); }} className="px-4 py-2.5 border border-warm-200 rounded-full text-brown-400 hover:text-brown-600 transition text-sm">取消</button>}
        </div>
      </form>

      <div className="bg-white rounded-2xl shadow-card p-5 mb-6 border border-warm-200">
        <h3 className="font-medium text-brown-700 mb-3">批量创建</h3>
        <div className="flex gap-3">
          <input type="text" value={batchInput} onChange={e => setBatchInput(e.target.value)} placeholder="逗号或空格分隔" className={inp} />
          <button onClick={handleBatch} className="px-5 py-2.5 bg-emerald-400 text-white rounded-full hover:bg-emerald-500 transition text-sm font-medium">批量创建</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-7 w-7 border-2 border-coral-200 border-t-coral-400"></div></div>
      ) : tags.length === 0 ? (
        <div className="text-center py-10 text-brown-400 bg-white rounded-2xl shadow-card border border-warm-200">暂无标签</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card p-5 border border-warm-200">
          <div className="flex flex-wrap gap-3">
            {tags.map(t => (
              <div key={t.id} className="flex items-center gap-2 bg-warm-50 border border-warm-200 rounded-full pl-3 pr-1 py-1">
                <span className="text-sm text-brown-700">{t.name}</span>
                <span className="text-xs text-brown-300">({t.article_count})</span>
                <button onClick={() => { setEditingId(t.id); setForm({ name: t.name }); }} className="text-xs text-coral-500 hover:underline px-2">编辑</button>
                <button onClick={() => handleDelete(t)} className="text-xs text-brown-300 hover:text-red-400 pr-2 transition">×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
