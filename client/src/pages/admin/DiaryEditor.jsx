import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { articlesAPI, uploadAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const TOOLS = [
  { label: 'H1', tag: 'h1', template: '<h1>标题</h1>' },
  { label: 'H2', tag: 'h2', template: '<h2>标题</h2>' },
  { label: 'B', tag: 'strong', template: '<strong>加粗</strong>' },
  { label: 'I', tag: 'em', template: '<em>斜体</em>' },
  { label: 'U', tag: 'u', template: '<u>下划线</u>' },
  { label: '🔗', tag: 'a', template: '<a href="https://">链接</a>' },
  { label: '🖼', tag: 'img', template: '<img src="/uploads/..." alt="图片" />' },
  { label: '❤️', tag: 'p', template: '<p style="text-align:center;color:#FF7F50;">💕</p>' },
  { label: '❝', tag: 'blockquote', template: '<blockquote>引用</blockquote>' },
  { label: '—', tag: 'hr', template: '<hr />' },
];

export default function DiaryEditor() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  const { isUser } = useAuth();

  const [form, setForm] = useState({ title: '', content: '', summary: '', cover_image: '', status: 'published' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isUser) navigate('/home');
    if (isEdit) {
      articlesAPI.getById(id).then(a => {
        setForm({ title: a.title || '', content: a.content || '', summary: a.summary || '', cover_image: a.cover_image || '', status: a.status || 'published' });
      }).catch(err => setError('加载失败: ' + err.message));
    }
  }, [id, isEdit]);

  const handleChange = (k, v) => setForm(p => ({ ...p, [k]: v }));

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
    else if (t.tag === 'a') { const ta = textareaRef.current; const sel = form.content.substring(ta?.selectionStart || 0, ta?.selectionEnd || 0) || '链接'; insertAtCursor(`<a href="https://">${sel}</a>`); }
    else insertAtCursor(t.template);
  };

  const handleUpload = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true);
    try { const r = await uploadAPI.uploadImage(f); const url = (r.url.startsWith('/') || r.url.startsWith('data:')) ? r.url : `/${r.url}`; insertAtCursor(`<img src="${url}" alt="${f.name}" />`); }
    catch (err) { alert('上传失败: ' + err.message); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.title.trim()) { setError('请输入标题'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      if (isEdit) { await articlesAPI.update(id, form); setSuccess('日记已更新！💕'); }
      else { const r = await articlesAPI.create(form); setSuccess('日记已发布！💕'); setTimeout(() => navigate(`/admin/diaries/${r.id}/edit`, { replace: true }), 800); return; }
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); return; }
    try { await articlesAPI.delete(id); navigate('/admin/diaries'); }
    catch (err) { alert(err.message); }
  };

  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSubmit(e); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [form, isEdit, id]);

  const inp = "w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-2xl text-brown-700 placeholder-brown-300 focus:outline-none focus:border-coral-300 transition";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brown-800">{isEdit ? '✏️ 编辑日记' : '✍️ 写日记'}</h1>
        <button onClick={() => navigate('/admin/diaries')} className="text-sm px-4 py-1.5 border border-warm-200 rounded-full text-brown-400 hover:text-coral-500 transition">返回列表</button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-500 text-sm p-3 rounded-2xl mb-4">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-500 text-sm p-3 rounded-2xl mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" value={form.title} onChange={e => handleChange('title', e.target.value)}
          className="w-full px-5 py-4 text-xl font-bold bg-white border border-warm-200 rounded-3xl text-brown-800 placeholder-brown-300 focus:outline-none focus:border-coral-300 shadow-card"
          placeholder="今天想写点什么？📝" />

        <textarea value={form.summary} onChange={e => handleChange('summary', e.target.value)} className={inp + " resize-none"} rows={2} placeholder="日记摘要..." />
        <input type="text" value={form.cover_image} onChange={e => handleChange('cover_image', e.target.value)} className={inp} placeholder="封面图片 URL（可选）..." />
        {form.cover_image && <img src={form.cover_image} alt="封面" className="h-40 rounded-2xl object-cover border border-warm-200" />}

        <div className="border border-warm-200 rounded-3xl overflow-hidden shadow-card">
          <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-warm-50 border-b border-warm-200">
            {TOOLS.map(t => (
              <button key={t.tag} type="button" onClick={() => handleToolClick(t)}
                className="px-2.5 py-1.5 text-xs font-medium text-brown-500 hover:bg-coral-50 hover:text-coral-500 rounded-xl transition">{t.label}</button>
            ))}
            <span className="mx-1 text-warm-300">|</span>
            <label className={`px-2.5 py-1.5 text-xs font-medium rounded-xl cursor-pointer ${uploading ? 'text-brown-300' : 'text-brown-500 hover:text-coral-500'}`}>
              {uploading ? '⏳' : '📷 上传'}
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
            </label>
            <span className="flex-1" />
            <button type="button" onClick={() => setPreview(!preview)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl ${preview ? 'bg-coral-50 text-coral-500' : 'text-brown-400 hover:text-brown-600'}`}>
              {preview ? '✏️ 编辑' : '👁 预览'}
            </button>
          </div>
          {preview ? (
            <div className="article-content px-5 py-4 min-h-[350px] max-h-[500px] overflow-y-auto bg-white"
              dangerouslySetInnerHTML={{ __html: form.content || '<p class="text-brown-300">还没有内容哦~</p>' }} />
          ) : (
            <textarea ref={textareaRef} value={form.content} onChange={e => handleChange('content', e.target.value)}
              className="w-full px-5 py-4 bg-white font-mono text-sm min-h-[350px] resize-y focus:outline-none text-brown-700 placeholder-brown-300"
              placeholder="<p>开始写日记吧... 💕</p>" />
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="px-6 py-3 bg-coral-400 text-white rounded-full hover:bg-coral-500 disabled:opacity-50 transition font-medium shadow-md shadow-coral-200">
            {saving ? '⏳...' : isEdit ? '💾 更新' : '💕 发布'}
          </button>
          <button type="button" onClick={() => navigate('/admin/diaries')}
            className="px-5 py-3 border border-warm-200 rounded-full text-brown-400 hover:text-brown-600 transition">取消</button>
          {isEdit && (
            <button type="button" onClick={handleDelete}
              className={`px-5 py-3 rounded-full ml-auto text-sm transition ${confirmDelete ? 'bg-red-50 text-red-500 border border-red-200' : 'text-brown-300 hover:text-red-400'}`}>
              {confirmDelete ? '⚠️ 确认？' : '🗑 删除'}
            </button>
          )}
        </div>
        <p className="text-xs text-brown-300">💡 <kbd className="bg-warm-100 px-1.5 py-0.5 rounded text-brown-400">Ctrl+S</kbd> 保存</p>
      </form>
    </div>
  );
}
