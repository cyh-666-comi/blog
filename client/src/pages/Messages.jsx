import { useState, useEffect } from 'react';
import { messagesAPI, uploadAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { compressImage } from '../utils/compress';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [bgImage, setBgImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user, isUser } = useAuth();

  useEffect(() => { setAuthor(user?.username || ''); }, [user]);

  const fetch = () => {
    messagesAPI.getList()
      .then(res => setMessages(res.data))
      .catch(console.error).finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (!confirm('确定删除这条留言吗？')) return;
    try { await messagesAPI.delete(id); fetch(); }
    catch (err) { alert(err.message); }
  };

  useEffect(() => { fetch(); }, []);

  const handleBgUpload = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true);
    try {
      const compressed = await compressImage(f);
      const r = await uploadAPI.uploadImage(compressed);
      const url = (r.url.startsWith('/') || r.url.startsWith('data:')) ? r.url : `/${r.url}`;
      setBgImage(url);
    } catch (err) { alert('上传失败'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await messagesAPI.create({
        content: text,
        author_name: author || '匿名',
        bg_color: '#FFF8F0',
        bg_image: bgImage,
      });
      setText(''); setBgImage('');
      fetch();
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <p className="text-5xl mb-2 animate-wobble inline-block">💬</p>
        <h1 className="text-xl font-bold text-brown-800">留言板</h1>
        <p className="text-brown-400 text-sm mt-1">贴一张照片，写一段话 🌸</p>
        <div className="cute-divider">🌸 💕 🌸</div>
      </div>

      {/* 发留言 */}
      <form onSubmit={handleSubmit} className="bg-white border border-warm-200 rounded-3xl p-5 shadow-card mb-8">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <input type="text" value={author} onChange={e => setAuthor(e.target.value)}
            placeholder="你的名字" className="w-28 px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl text-sm text-brown-700 focus:outline-none focus:border-coral-300" />
          <label className={`px-4 py-2 rounded-full text-sm cursor-pointer transition font-medium ${bgImage ? 'bg-coral-100 text-coral-500 border border-coral-300' : 'bg-warm-50 text-brown-400 border border-warm-200 hover:border-coral-300'}`}>
            {uploading ? '⏳ 上传中' : bgImage ? '📸 背景已选 ✓' : '🖼️ 选择背景照片'}
            <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" disabled={uploading} />
          </label>
          {bgImage && (
            <button type="button" onClick={() => setBgImage('')}
              className="text-xs text-red-400 hover:underline">清除背景</button>
          )}
        </div>

        {/* 预览 */}
        <div className="relative rounded-2xl overflow-hidden mb-3 min-h-[140px] flex items-center justify-center" style={{
          backgroundImage: bgImage ? `url(${bgImage})` : 'none',
          backgroundColor: bgImage ? 'transparent' : '#FFF5EC',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          {!bgImage && (
            <p className="text-brown-300 text-sm">📸 请先选择一张背景照片</p>
          )}
          {bgImage && (
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder="说点什么..."
              className="w-full bg-transparent text-lg text-center placeholder-white/60 focus:outline-none resize-none font-bold px-6"
              style={{ color: '#fff', textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}
              rows={3} />
          )}
        </div>

        <button type="submit" disabled={submitting || !text.trim()}
          className="px-6 py-2.5 bg-coral-400 text-white rounded-full text-sm hover:bg-coral-500 disabled:opacity-40 transition font-medium shadow-md shadow-coral-200">
          {submitting ? '发送中...' : '💕 贴上去'}
        </button>
      </form>

      {/* 留言列表 */}
      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-7 w-7 border-2 border-coral-200 border-t-coral-400"></div></div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16 text-brown-400 bg-white rounded-3xl shadow-card border border-warm-200">
          <p className="text-5xl mb-4 animate-wobble inline-block">📭</p>
          <p className="text-lg">还没有留言呢~</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((m, i) => (
            <div key={m.id}
              className="relative rounded-2xl overflow-hidden shadow-md group min-h-[220px] flex items-center justify-center p-6"
              style={{
                backgroundImage: m.bg_image ? `url(${m.bg_image})` : 'none',
                backgroundColor: m.bg_image ? 'transparent' : (m.bg_color || '#FFF8F0'),
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}>
              {/* 左上角：名字 + 日期 */}
              <div className="absolute top-3 left-4 z-20 flex items-center gap-2">
                <span className="font-bold text-sm"
                  style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{m.author_name}</span>
                <span className="text-xs"
                  style={{ color: 'rgba(255,255,255,0.75)', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                  {new Date(m.created_at).toLocaleDateString('zh-CN')}
                </span>
              </div>

              {/* 右下角删除 */}
              {isUser && (
                <button onClick={() => handleDelete(m.id)}
                  className="absolute bottom-3 right-4 z-20 text-xs text-white/50 hover:text-red-300 opacity-0 group-hover:opacity-100 transition">✕</button>
              )}

              {/* 正文 */}
              <p className="relative z-10 text-lg leading-relaxed whitespace-pre-wrap font-bold text-center max-w-lg"
                style={{ color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.4)' }}>
                {m.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
