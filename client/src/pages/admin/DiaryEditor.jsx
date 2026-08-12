import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { articlesAPI, uploadAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function DiaryEditor() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { isUser } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isUser) navigate('/home');
    if (isEdit) {
      articlesAPI.getById(id).then(a => {
        setTitle(a.title || ''); setContent(a.content || ''); setCoverImage(a.cover_image || '');
      }).catch(err => setError('加载失败: ' + err.message));
    }
  }, [id, isEdit]);

  const handleUpload = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true);
    try {
      const r = await uploadAPI.uploadImage(f);
      const url = (r.url.startsWith('/') || r.url.startsWith('data:')) ? r.url : `/${r.url}`;
      setContent(prev => prev + `<img src="${url}" alt="${f.name}" /><br/>`);
    } catch (err) { alert('上传失败: ' + err.message); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!title.trim()) { setError('请输入标题'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      const data = { title, content, cover_image: coverImage, status: 'published' };
      if (isEdit) { await articlesAPI.update(id, data); setSuccess('日记已更新！💕'); }
      else { await articlesAPI.create(data); setSuccess('日记已发布！💕'); navigate('/home'); return; }
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); return; }
    try { await articlesAPI.delete(id); navigate('/admin/diaries'); }
    catch (err) { alert(err.message); }
  };

  const inp = "w-full px-4 py-3 bg-white border border-warm-200 rounded-2xl text-brown-700 placeholder-brown-300 focus:outline-none focus:border-coral-300 transition";

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
            className={inp + " flex-1"} placeholder="封面图片链接（可选）" />
          <label className={`px-4 py-3 rounded-2xl text-sm cursor-pointer transition font-medium ${uploading ? 'bg-warm-200 text-brown-400' : 'bg-coral-400 text-white hover:bg-coral-500 shadow-md shadow-coral-200'}`}>
            {uploading ? '⏳' : '📷'}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
        {coverImage && <img src={coverImage} alt="封面" className="w-full h-48 object-cover rounded-2xl border border-warm-200" />}

        {/* 切换按钮 */}
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setEditing(false)}
            className={`text-xs px-4 py-1.5 rounded-full transition ${!editing ? 'bg-coral-400 text-white' : 'bg-warm-100 text-brown-400'}`}>👁 预览</button>
          <button type="button" onClick={() => setEditing(true)}
            className={`text-xs px-4 py-1.5 rounded-full transition ${editing ? 'bg-coral-400 text-white' : 'bg-warm-100 text-brown-400'}`}>✏️ 编辑</button>
          <span className="flex-1" />
          <label className="text-xs text-brown-400 hover:text-coral-500 transition cursor-pointer">
            📷 插入图片
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>

        {/* 内容区 */}
        {!editing && content ? (
          <div className="article-content bg-white border border-warm-200 rounded-2xl p-5 min-h-[200px] shadow-card"
            dangerouslySetInnerHTML={{ __html: content }} />
        ) : !editing && !content ? (
          <div className="bg-white border border-warm-200 rounded-2xl p-5 min-h-[200px] shadow-card flex items-center justify-center text-brown-300">
            <p>点击"✏️ 编辑"开始写日记~</p>
          </div>
        ) : (
          <textarea value={content} onChange={e => setContent(e.target.value)}
            className="w-full px-5 py-4 bg-white border border-warm-200 rounded-2xl font-mono text-sm min-h-[300px] resize-y focus:outline-none focus:border-coral-300 text-brown-700 placeholder-brown-300 shadow-card"
            placeholder="写点什么...&#10;&#10;小提示：换行会自动分段，插入图片用 📷 按钮" />
        )}

        {/* 按钮 */}
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
