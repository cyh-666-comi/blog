import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { articlesAPI, categoriesAPI, tagsAPI, uploadAPI } from '../../api/client';

const TOOLS = [
  { label: 'H1', tag: 'h1', template: '<h1>标题</h1>' },
  { label: 'H2', tag: 'h2', template: '<h2>标题</h2>' },
  { label: 'H3', tag: 'h3', template: '<h3>标题</h3>' },
  { label: 'B', tag: 'strong', template: '<strong>加粗</strong>' },
  { label: 'I', tag: 'em', template: '<em>斜体</em>' },
  { label: 'U', tag: 'u', template: '<u>下划线</u>' },
  { label: '🔗', tag: 'a', template: '<a href="https://">链接</a>' },
  { label: '🖼', tag: 'img', template: '<img src="/uploads/..." alt="图片" />' },
  { label: '❝', tag: 'blockquote', template: '<blockquote>引用文本</blockquote>' },
  { label: '•', tag: 'ul', template: '<ul>\n  <li>项目1</li>\n  <li>项目2</li>\n</ul>' },
  { label: '1.', tag: 'ol', template: '<ol>\n  <li>第一项</li>\n  <li>第二项</li>\n</ol>' },
  { label: '<>', tag: 'code', template: '<pre><code>代码</code></pre>' },
  { label: '—', tag: 'hr', template: '<hr />' },
  { label: 'P', tag: 'p', template: '<p>段落</p>' },
];

export default function ArticleEditor() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  const [form, setForm] = useState({ title: '', content: '', summary: '', cover_image: '', status: 'draft', category_id: '', tag_ids: [] });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    categoriesAPI.getList().then(res => setCategories(res.data)).catch(() => {});
    tagsAPI.getList().then(res => setTags(res.data)).catch(() => {});
    if (isEdit) {
      articlesAPI.getById(id).then(a => {
        setForm({ title: a.title || '', content: a.content || '', summary: a.summary || '', cover_image: a.cover_image || '', status: a.status || 'draft', category_id: a.category?.id || '', tag_ids: (a.tags || []).map(t => t.id) });
      }).catch(err => setError('加载失败: ' + err.message));
    }
  }, [id, isEdit]);

  const handleChange = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleTagToggle = (tid) => setForm(p => ({ ...p, tag_ids: p.tag_ids.includes(tid) ? p.tag_ids.filter(i => i !== tid) : [...p.tag_ids, tid] }));

  const insertAtCursor = (tpl) => {
    const ta = textareaRef.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    handleChange('content', form.content.substring(0, s) + tpl + form.content.substring(e));
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + tpl.length; }, 0);
  };

  const wrapSelection = (b, a) => {
    const ta = textareaRef.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = form.content.substring(s, e) || '文本';
    handleChange('content', form.content.substring(0, s) + b + sel + a + form.content.substring(e));
    setTimeout(() => { ta.focus(); ta.selectionStart = s + b.length; ta.selectionEnd = s + b.length + sel.length; }, 0);
  };

  const handleToolClick = (t) => {
    if (t.tag === 'strong') wrapSelection('<strong>', '</strong>');
    else if (t.tag === 'em') wrapSelection('<em>', '</em>');
    else if (t.tag === 'u') wrapSelection('<u>', '</u>');
    else if (t.tag === 'a') { const ta = textareaRef.current; const sel = form.content.substring(ta?.selectionStart || 0, ta?.selectionEnd || 0) || '链接文字'; insertAtCursor(`<a href="https://">${sel}</a>`); }
    else insertAtCursor(t.template);
  };

  const handleImageUpload = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true);
    try { const r = await uploadAPI.uploadImage(f); const url = r.url.startsWith('/') ? r.url : `/${r.url}`; insertAtCursor(`<img src="${url}" alt="${f.name}" />`); }
    catch (err) { alert('上传失败: ' + err.message); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.title.trim()) { setError('请输入日记标题'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      const data = { ...form, category_id: form.category_id || null };
      if (isEdit) { await articlesAPI.update(id, data); setSuccess('日记已更新！'); }
      else { const r = await articlesAPI.create(data); setSuccess('日记已发布！💕'); setTimeout(() => navigate(`/admin/articles/${r.id}/edit`, { replace: true }), 800); return; }
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); return; }
    try { await articlesAPI.delete(id); navigate('/admin/articles'); }
    catch (err) { alert(err.message); }
  };

  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSubmit(e); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [form, isEdit, id]);

  const inp = "w-full px-4 py-2.5 bg-warm-50 border border-warm-200 rounded-2xl text-brown-700 placeholder-brown-300 focus:outline-none focus:border-coral-300 focus:ring-2 focus:ring-coral-100 transition";

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brown-800">{isEdit ? '✏️ 编辑日记' : '✍️ 写日记'}</h1>
        <button onClick={() => navigate('/admin/articles')} className="text-sm px-4 py-1.5 border border-warm-200 rounded-full text-brown-400 hover:text-coral-500 hover:border-coral-300 transition">返回列表</button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-500 text-sm p-3 rounded-2xl mb-4 flex items-center gap-2">⚠️ {error}<button onClick={() => setError('')} className="ml-auto opacity-60 hover:opacity-100">×</button></div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-500 text-sm p-3 rounded-2xl mb-4 flex items-center gap-2">✅ {success}<button onClick={() => setSuccess('')} className="ml-auto opacity-60 hover:opacity-100">×</button></div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <input type="text" value={form.title} onChange={e => handleChange('title', e.target.value)}
          className="w-full px-5 py-3.5 text-xl font-bold bg-white border border-warm-200 rounded-3xl text-brown-800 placeholder-brown-300 focus:outline-none focus:border-coral-300 focus:ring-2 focus:ring-coral-100 transition shadow-card"
          placeholder="今天想写点什么？📝" />

        <div className="flex flex-wrap items-center gap-3">
          <select value={form.category_id} onChange={e => handleChange('category_id', e.target.value)} className={inp + " w-auto"}>
            <option value="">📂 无分类</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={form.status} onChange={e => handleChange('status', e.target.value)} className={inp + " w-auto"}>
            <option value="draft">📝 草稿</option>
            <option value="published">💕 发布</option>
          </select>
          <div className="flex flex-wrap gap-1.5">
            {tags.map(t => (
              <button key={t.id} type="button" onClick={() => handleTagToggle(t.id)}
                className={`text-xs px-3 py-1 rounded-full transition border ${
                  form.tag_ids.includes(t.id) ? 'bg-coral-50 text-coral-500 border-coral-200' : 'bg-white text-brown-400 border-warm-200 hover:border-coral-300'
                }`}>{t.name}</button>
            ))}
            {tags.length === 0 && <span className="text-xs text-brown-300 py-1">还没有标签~</span>}
          </div>
        </div>

        <textarea value={form.summary} onChange={e => handleChange('summary', e.target.value)} className={inp + " resize-none"} rows={2} placeholder="日记摘要（可选）..." />
        <input type="text" value={form.cover_image} onChange={e => handleChange('cover_image', e.target.value)} className={inp} placeholder="封面图片URL（可选）..." />
        {form.cover_image && <img src={form.cover_image} alt="封面" className="mt-2 h-40 rounded-2xl object-cover border border-warm-200" />}

        <div className="border border-warm-200 rounded-3xl overflow-hidden shadow-card">
          <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-warm-50 border-b border-warm-200">
            {TOOLS.map(t => (
              <button key={t.tag} type="button" onClick={() => handleToolClick(t)} title={`插入 <${t.tag}>`}
                className="px-2.5 py-1.5 text-xs font-medium text-brown-500 hover:bg-coral-50 hover:text-coral-500 rounded-xl transition">{t.label}</button>
            ))}
            <span className="mx-1 text-warm-300">|</span>
            <label className={`px-2.5 py-1.5 text-xs font-medium rounded-xl transition cursor-pointer ${uploading ? 'text-brown-300' : 'text-brown-500 hover:bg-coral-50 hover:text-coral-500'}`}>
              {uploading ? '⏳' : '📷 上传图片'}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
            <span className="flex-1" />
            <button type="button" onClick={() => setPreview(!preview)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition ${preview ? 'bg-coral-50 text-coral-500' : 'text-brown-400 hover:bg-warm-100'}`}>
              {preview ? '✏️ 编辑' : '👁 预览'}
            </button>
          </div>
          {preview ? (
            <div className="article-content px-5 py-4 min-h-[400px] max-h-[600px] overflow-y-auto bg-white"
              dangerouslySetInnerHTML={{ __html: form.content || '<p class="text-brown-300">还没有内容哦~</p>' }} />
          ) : (
            <textarea ref={textareaRef} value={form.content} onChange={e => handleChange('content', e.target.value)}
              className="w-full px-5 py-4 bg-white font-mono text-sm min-h-[400px] resize-y focus:outline-none text-brown-700 placeholder-brown-300"
              placeholder="<p>开始写日记吧... 💕</p>" />
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="px-6 py-3 bg-coral-400 text-white rounded-full hover:bg-coral-500 disabled:opacity-50 transition font-medium shadow-md shadow-coral-200">
            {saving ? '⏳ 保存中...' : isEdit ? '💾 更新日记' : '💕 发布日记'}
          </button>
          <button type="button" onClick={() => navigate('/admin/articles')}
            className="px-5 py-3 border border-warm-200 rounded-full text-brown-400 hover:text-brown-600 hover:border-warm-300 transition">取消</button>
          {isEdit && (
            <button type="button" onClick={handleDelete}
              className={`px-5 py-3 rounded-full transition ml-auto text-sm ${confirmDelete ? 'bg-red-50 text-red-500 border border-red-200' : 'border border-warm-200 text-brown-300 hover:text-red-400'}`}>
              {confirmDelete ? '⚠️ 确认删除？' : '🗑 删除'}
            </button>
          )}
        </div>
        <p className="text-xs text-brown-300">💡 <kbd className="bg-warm-100 border border-warm-200 px-1.5 py-0.5 rounded-lg text-brown-400">Ctrl+S</kbd> 保存</p>
      </form>
    </div>
  );
}
