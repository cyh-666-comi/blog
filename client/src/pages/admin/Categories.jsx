import { useState, useEffect } from 'react';
import { categoriesAPI } from '../../api/client';

export default function Categories() {
  const [cats, setCats] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);

  const fetch = () => categoriesAPI.getList().then(res => setCats(res.data)).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const reset = () => { setForm({ name: '', description: '' }); setEditing(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('请输入分类名称');
    try { editing ? await categoriesAPI.update(editing.id, form) : await categoriesAPI.create(form); reset(); fetch(); }
    catch (err) { alert(err.message); }
  };

  const handleDelete = async (c) => {
    if (!confirm(`确定删除「${c.name}」吗？`)) return;
    try { await categoriesAPI.delete(c.id); fetch(); } catch (err) { alert(err.message); }
  };

  const inp = "flex-1 px-4 py-2.5 bg-warm-50 border border-warm-200 rounded-2xl text-brown-700 placeholder-brown-300 focus:outline-none focus:border-coral-300 transition";

  return (
    <div>
      <h1 className="text-2xl font-bold text-brown-800 mb-6">📂 分类管理</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-5 mb-6 border border-warm-200">
        <h3 className="font-medium text-brown-700 mb-3">{editing ? '编辑分类' : '新建分类'}</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="分类名称" className={inp} />
          <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="描述" className={inp} />
          <button type="submit" className="px-5 py-2.5 bg-coral-400 text-white rounded-full hover:bg-coral-500 transition text-sm font-medium">{editing ? '更新' : '创建'}</button>
          {editing && <button type="button" onClick={reset} className="px-4 py-2.5 border border-warm-200 rounded-full text-brown-400 hover:text-brown-600 transition text-sm">取消</button>}
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-7 w-7 border-2 border-coral-200 border-t-coral-400"></div></div>
      ) : cats.length === 0 ? (
        <div className="text-center py-10 text-brown-400 bg-white rounded-2xl shadow-card border border-warm-200">暂无分类</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-warm-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-brown-400 bg-warm-50 border-b border-warm-200">
                <th className="py-3 px-4 font-medium">名称</th><th className="py-3 px-4 font-medium">Slug</th><th className="py-3 px-4 font-medium">描述</th><th className="py-3 px-4 font-medium w-20">日记数</th><th className="py-3 px-4 font-medium w-32">操作</th>
              </tr>
            </thead>
            <tbody>
              {cats.map(c => (
                <tr key={c.id} className="border-b border-warm-100 last:border-0 hover:bg-coral-50/30 transition">
                  <td className="py-3 px-4 font-medium text-brown-700">{c.name}</td>
                  <td className="py-3 px-4 text-brown-400">{c.slug}</td>
                  <td className="py-3 px-4 text-brown-400">{c.description || '-'}</td>
                  <td className="py-3 px-4 text-brown-400">{c.article_count}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => { setEditing(c); setForm({ name: c.name, description: c.description || '' }); }} className="text-xs text-coral-500 hover:underline mr-3">编辑</button>
                    <button onClick={() => handleDelete(c)} className="text-xs text-brown-300 hover:text-red-400 transition">删除</button>
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
