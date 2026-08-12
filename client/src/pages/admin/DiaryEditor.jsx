import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { articlesAPI, uploadAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { compressImage } from '../../utils/compress';

export default function DiaryEditor() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const { isUser } = useAuth();

  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isUser) navigate('/home');
    if (isEdit) {
      articlesAPI.getById(id).then(a => {
        setTitle(a.title || '');
        setCoverImage(a.cover_image || '');
        if (editorRef.current) editorRef.current.innerHTML = a.content || '';
      }).catch(err => setError('加载失败: ' + err.message));
    }
  }, [id, isEdit]);

  // 工具栏命令
  const exec = (cmd, val) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  };

  // 插入图片
  const insertImage = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true);
    try {
      const compressed = await compressImage(f);
      const r = await uploadAPI.uploadImage(compressed);
      const url = (r.url.startsWith('/') || r.url.startsWith('data:')) ? r.url : `/${r.url}`;
      // 直接在编辑器中插入 img 元素
      const editor = editorRef.current;
      if (editor) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = f.name;
        img.style.maxWidth = '100%';
        img.style.borderRadius = '12px';
        img.style.margin = '12px 0';
        img.style.display = 'block';
        editor.appendChild(img);
        // 在图片后加个换行，方便继续打字
        const br = document.createElement('br');
        editor.appendChild(br);
        editor.focus();
      }
    } catch (err) { alert('上传失败: ' + (err.response?.data?.message || err.message)); }
    finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!title.trim()) { setError('请输入标题'); return; }
    setSaving(true); setError(''); setSuccess('');
    const content = editorRef.current?.innerHTML || '';
    try {
      const data = { title, content, cover_image: coverImage, status: 'published' };
      if (isEdit) { await articlesAPI.update(id, data); setSuccess('日记已更新！💕'); }
      else { await articlesAPI.create(data); setSuccess('日记已发布！'); navigate('/home'); return; }
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); return; }
    try { await articlesAPI.delete(id); navigate('/admin/diaries'); }
    catch (err) { alert(err.message); }
  };

  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSubmit(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [title, coverImage, isEdit, id]);

  const btn = "p-2 text-brown-500 hover:bg-coral-50 hover:text-coral-500 rounded-xl transition text-sm font-medium min-w-[36px]";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-brown-800">{isEdit ? '✏️ 编辑日记' : '✍️ 写日记'}</h1>
        <button onClick={() => navigate('/admin/diaries')} className="text-sm text-brown-400 hover:text-coral-500 transition">← 返回</button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-500 text-sm p-3 rounded-2xl mb-3">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-500 text-sm p-3 rounded-2xl mb-3">{success}</div>}

      <div className="space-y-4">
        {/* 标题 */}
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          className="w-full px-5 py-4 text-xl font-bold bg-white border border-warm-200 rounded-3xl text-brown-800 placeholder-brown-300 focus:outline-none focus:border-coral-300 shadow-card"
          placeholder="今天想写点什么？" />

        {/* 封面图 */}
        <div className="flex gap-2">
          <input type="text" value={coverImage} onChange={e => setCoverImage(e.target.value)}
            className="flex-1 px-4 py-3 bg-white border border-warm-200 rounded-2xl text-brown-700 placeholder-brown-300 focus:outline-none focus:border-coral-300 transition text-sm"
            placeholder="封面图片链接（可选）" />
        </div>
        {coverImage && <img src={coverImage} alt="封面" className="w-full h-48 object-cover rounded-2xl border border-warm-200" />}

        {/* 工具栏 */}
        <div className="flex items-center gap-1 bg-white border border-warm-200 rounded-2xl px-2 py-1 shadow-card flex-wrap">
          <button onClick={() => exec('bold')} className={btn} title="加粗"><b>B</b></button>
          <button onClick={() => exec('italic')} className={btn} title="斜体"><i>I</i></button>
          <button onClick={() => exec('underline')} className={btn} title="下划线"><u>U</u></button>
          <span className="text-warm-300 mx-1">|</span>
          <button onClick={() => exec('formatBlock', '<h2>')} className={btn} title="大标题">H</button>
          <button onClick={() => exec('formatBlock', '<h3>')} className={btn + " text-xs"} title="小标题">h</button>
          <button onClick={() => exec('formatBlock', '<p>')} className={btn + " text-xs"} title="正文">P</button>
          <span className="text-warm-300 mx-1">|</span>
          <button onClick={() => exec('insertUnorderedList')} className={btn} title="列表">•</button>
          <button onClick={() => exec('insertOrderedList')} className={btn} title="编号">1.</button>
          <span className="text-warm-300 mx-1">|</span>
          <label className={`${btn} cursor-pointer ${uploading ? 'opacity-40' : ''}`} title="插入图片">
            📷<input type="file" accept="image/*" onChange={insertImage} className="hidden" disabled={uploading} />
          </label>
          <button onClick={() => exec('removeFormat')} className={btn + " text-xs"} title="清除格式">✕</button>
        </div>

        {/* 编辑器：所见即所得 */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="w-full min-h-[400px] bg-white border border-warm-200 rounded-2xl p-6 text-brown-700 leading-8 focus:outline-none focus:border-coral-300 shadow-card text-base"
          style={{ whiteSpace: 'pre-wrap' }}
          data-placeholder="开始写日记吧... 💕"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              // 回车自动分段
            }
            // Ctrl+B/I/U 快捷键
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); exec('bold'); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); exec('italic'); }
          }}
        />

        {/* 占位提示 */}
        {!isEdit && (
          <p className="text-xs text-brown-300 text-center -mt-2">
            💡 像 Word 一样直接打字 | 选中文字用工具栏加粗/变色 | 📷 插入照片
          </p>
        )}

        {/* 底部按钮 */}
        <div className="flex items-center gap-3">
          <button onClick={handleSubmit} disabled={saving}
            className="px-8 py-3 bg-coral-400 text-white rounded-full hover:bg-coral-500 disabled:opacity-50 transition font-medium shadow-md shadow-coral-200">
            {saving ? '⏳...' : isEdit ? '💾 保存' : '💕 发布'}
          </button>
          {isEdit && (
            <button onClick={handleDelete}
              className={`px-5 py-3 rounded-full text-sm transition ${confirmDelete ? 'bg-red-50 text-red-500 border border-red-200' : 'text-brown-300 hover:text-red-400'}`}>
              {confirmDelete ? '⚠️ 确认？' : '🗑 删除'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
