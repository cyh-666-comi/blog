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

  const [form, setForm] = useState({
    title: '', content: '', summary: '', cover_image: '',
    status: 'draft', category_id: '', tag_ids: [],
  });
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
      articlesAPI.getById(id).then(article => {
        setForm({
          title: article.title || '', content: article.content || '', summary: article.summary || '',
          cover_image: article.cover_image || '', status: article.status || 'draft',
          category_id: article.category?.id || '', tag_ids: (article.tags || []).map(t => t.id),
        });
      }).catch(err => setError('加载文章失败: ' + err.message));
    }
  }, [id, isEdit]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleTagToggle = (tagId) => {
    setForm(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId) ? prev.tag_ids.filter(id => id !== tagId) : [...prev.tag_ids, tagId],
    }));
  };

  const insertAtCursor = (template) => {
    const ta = textareaRef.current; if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    handleChange('content', form.content.substring(0, start) + template + form.content.substring(end));
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = start + template.length; }, 0);
  };

  const wrapSelection = (before, after) => {
    const ta = textareaRef.current; if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const selected = form.content.substring(start, end) || '文本';
    handleChange('content', form.content.substring(0, start) + before + selected + after + form.content.substring(end));
    setTimeout(() => { ta.focus(); ta.selectionStart = start + before.length; ta.selectionEnd = start + before.length + selected.length; }, 0);
  };

  const handleToolClick = (tool) => {
    if (tool.tag === 'strong') wrapSelection('<strong>', '</strong>');
    else if (tool.tag === 'em') wrapSelection('<em>', '</em>');
    else if (tool.tag === 'u') wrapSelection('<u>', '</u>');
    else if (tool.tag === 'a') {
      const ta = textareaRef.current;
      const selected = form.content.substring(ta?.selectionStart || 0, ta?.selectionEnd || 0) || '链接文字';
      insertAtCursor(`<a href="https://">${selected}</a>`);
    } else insertAtCursor(tool.template);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAPI.uploadImage(file);
      const fullUrl = res.url.startsWith('/') ? res.url : `/${res.url}`;
      insertAtCursor(`<img src="${fullUrl}" alt="${file.name}" />`);
    } catch (err) { alert('上传失败: ' + err.message); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.title.trim()) { setError('请输入文章标题'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      const data = { ...form, category_id: form.category_id || null };
      if (isEdit) { await articlesAPI.update(id, data); setSuccess('文章已更新！'); }
      else { const result = await articlesAPI.create(data); setSuccess('文章已发布！'); setTimeout(() => navigate(`/admin/articles/${result.id}/edit`, { replace: true }), 800); return; }
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); return; }
    try { await articlesAPI.delete(id); navigate('/admin/articles'); }
    catch (err) { alert(err.message); }
  };

  useEffect(() => {
    const handler = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSubmit(e); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [form, isEdit, id]);

  const inputClass = "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition";

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">{isEdit ? '✏️ 编辑文章' : '✏️ 写文章'}</h1>
        <button onClick={() => navigate('/admin/articles')} className="text-sm px-4 py-1.5 border border-slate-700 rounded-lg text-slate-400 hover:text-slate-200 hover:border-slate-500 transition">返回列表</button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4 flex items-center gap-2">⚠️ {error}<button onClick={() => setError('')} className="ml-auto opacity-60 hover:opacity-100">×</button></div>}
      {success && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-3 rounded-lg mb-4 flex items-center gap-2">✅ {success}<button onClick={() => setSuccess('')} className="ml-auto opacity-60 hover:opacity-100">×</button></div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <input type="text" value={form.title} onChange={e => handleChange('title', e.target.value)}
          className="w-full px-4 py-3 text-xl font-bold bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition"
          placeholder="输入文章标题..." />

        <div className="flex flex-wrap items-center gap-3">
          <select value={form.category_id} onChange={e => handleChange('category_id', e.target.value)} className={inputClass + " w-auto"}>
            <option value="">📁 无分类</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <select value={form.status} onChange={e => handleChange('status', e.target.value)} className={inputClass + " w-auto"}>
            <option value="draft">📝 草稿</option>
            <option value="published">🚀 发布</option>
          </select>
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => (
              <button key={tag.id} type="button" onClick={() => handleTagToggle(tag.id)}
                className={`text-xs px-2.5 py-1 rounded-full transition ${
                  form.tag_ids.includes(tag.id)
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 hover:border-slate-500 hover:text-slate-300'
                }`}>{tag.name}</button>
            ))}
            {tags.length === 0 && <span className="text-xs text-slate-600 py-1">无标签（去标签管理创建）</span>}
          </div>
        </div>

        <textarea value={form.summary} onChange={e => handleChange('summary', e.target.value)} className={inputClass + " resize-none"} rows={2} placeholder="文章摘要（可选，显示在文章列表中）..." />

        <div>
          <input type="text" value={form.cover_image} onChange={e => handleChange('cover_image', e.target.value)} className={inputClass} placeholder="封面图片 URL（可选）..." />
          {form.cover_image && <img src={form.cover_image} alt="封面" className="mt-2 h-40 rounded-lg object-cover border border-slate-700" />}
        </div>

        <div className="border border-slate-700 rounded-lg overflow-hidden">
          <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 bg-slate-800 border-b border-slate-700">
            {TOOLS.map(tool => (
              <button key={tool.tag} type="button" onClick={() => handleToolClick(tool)} title={`插入 <${tool.tag}>`}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-700 hover:text-slate-200 rounded transition">{tool.label}</button>
            ))}
            <span className="mx-1 text-slate-700">|</span>
            <label className={`px-2.5 py-1.5 text-xs font-medium rounded transition cursor-pointer ${uploading ? 'text-slate-600' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}>
              {uploading ? '⏳ 上传中' : '📷 上传图片'}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
            <span className="flex-1" />
            <button type="button" onClick={() => setPreview(!preview)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition ${preview ? 'bg-cyan-500/15 text-cyan-400' : 'text-slate-500 hover:bg-slate-700 hover:text-slate-300'}`}>
              {preview ? '✏️ 编辑' : '👁 预览'}
            </button>
          </div>
          {preview ? (
            <div className="article-content px-4 py-3 min-h-[400px] max-h-[600px] overflow-y-auto bg-slate-900"
              dangerouslySetInnerHTML={{ __html: form.content || '<p class="text-slate-600">暂无内容</p>' }} />
          ) : (
            <textarea ref={textareaRef} value={form.content} onChange={e => handleChange('content', e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 font-mono text-sm min-h-[400px] resize-y focus:outline-none text-slate-200 placeholder-slate-600"
              placeholder="<p>开始写作... 使用上方工具栏快速插入格式，或直接编写 HTML</p>" />
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 transition font-medium shadow-lg shadow-cyan-500/10">
            {saving ? '⏳ 保存中...' : isEdit ? '💾 更新文章' : '🚀 发布文章'}
          </button>
          <button type="button" onClick={() => navigate('/admin/articles')} className="px-5 py-2.5 border border-slate-700 rounded-lg text-slate-400 hover:text-slate-200 hover:border-slate-500 transition">取消</button>
          {isEdit && (
            <button type="button" onClick={handleDelete}
              className={`px-5 py-2.5 rounded-lg transition ml-auto text-sm ${
                confirmDelete ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'border border-slate-700 text-slate-500 hover:text-red-400 hover:border-red-500/30'
              }`}>{confirmDelete ? '⚠️ 确认删除？' : '🗑 删除文章'}</button>
          )}
        </div>
        <p className="text-xs text-slate-600">💡 提示：支持 HTML 直接编辑。快捷键 <kbd className="bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-400 text-xs">Ctrl+S</kbd> 保存</p>
      </form>
    </div>
  );
}
