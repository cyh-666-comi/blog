import { useState, useEffect } from 'react';
import { categoriesAPI } from '../../api/client';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);

  const fetch = () => categoriesAPI.getList().then(res => setCategories(res.data)).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const reset = () => { setForm({ name: '', description: '' }); setEditing(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('请输入分类名称');
    try { editing ? await categoriesAPI.update(editing.id, form) : await categoriesAPI.create(form); reset(); fetch(); }
    catch (err) { alert(err.message); }
  };

  const handleDelete = async (cat) => {
    if (!confirm(`确定要删除分类"${cat.name}"吗？`)) return;
    try { await categoriesAPI.delete(cat.id); fetch(); } catch (err) { alert(err.message); }
  };

  const inp = "flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-100 mb-6">📁 分类管理</h1>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
        <h3 className="font-medium text-slate-200 mb-3">{editing ? '编辑分类' : '新建分类'}</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="分类名称" className={inp} />
          <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="描述（可选）" className={inp} />
          <button type="submit" className="px-5 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition text-sm font-medium">{editing ? '更新' : '创建'}</button>
          {editing && <button type="button" onClick={reset} className="px-4 py-2 border border-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition text-sm">取消</button>}
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-7 w-7 border-2 border-slate-700 border-t-cyan-500"></div></div>
      ) : categories.length === 0 ? (
        <div className="text-center py-10 text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">暂无分类</div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 bg-slate-900 border-b border-slate-800">
                <th className="py-3 px-4 font-medium">名称</th><th className="py-3 px-4 font-medium">Slug</th><th className="py-3 px-4 font-medium">描述</th><th className="py-3 px-4 font-medium w-20">文章数</th><th className="py-3 px-4 font-medium w-32">操作</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/50 transition">
                  <td className="py-3 px-4 font-medium text-slate-200">{cat.name}</td>
                  <td className="py-3 px-4 text-slate-500">{cat.slug}</td>
                  <td className="py-3 px-4 text-slate-500">{cat.description || '-'}</td>
                  <td className="py-3 px-4 text-slate-500">{cat.article_count}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => { setEditing(cat); setForm({ name: cat.name, description: cat.description || '' }); }} className="text-xs text-cyan-400 hover:underline mr-3">编辑</button>
                    <button onClick={() => handleDelete(cat)} className="text-xs text-slate-500 hover:text-red-400 transition">删除</button>
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
