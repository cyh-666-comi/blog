import { useState, useEffect } from 'react';
import { messagesAPI, uploadAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { compressImage } from '../utils/compress';

const BG_COLORS = [
  { color: '#FFF8F0', label: '奶油' },
  { color: '#FFF0F5', label: '樱花' },
  { color: '#F0FFF4', label: '薄荷' },
  { color: '#F0F8FF', label: '天空' },
  { color: '#FFFACD', label: '柠檬' },
  { color: '#F5F0FF', label: '薰衣草' },
  { color: '#FFF5EE', label: '蜜桃' },
  { color: '#F5FFFA', label: '海洋' },
];

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [bgColor, setBgColor] = useState('#FFF8F0');
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
      setBgColor(''); // 选了照片就清空纯色
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
        bg_color: bgColor,
        bg_image: bgImage,
      });
      setText(''); setBgImage(''); setBgColor('#FFF8F0');
      fetch();
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <p className="text-5xl mb-2 animate-wobble inline-block">💬</p>
        <h1 className="text-xl font-bold text-brown-800">留言板</h1>
        <p className="text-brown-400 text-sm mt-1">选个背景，贴一张小纸条 🌸</p>
        <div className="cute-divider">🌸 💕 🌸</div>
      </div>

      {/* 发留言 */}
      <form onSubmit={handleSubmit} className="bg-white border border-warm-200 rounded-3xl p-5 shadow-card mb-8">
        <div className="flex gap-3 mb-3 items-center">
          <input type="text" value={author} onChange={e => setAuthor(e.target.value)}
            placeholder="你的名字" className="w-28 px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl text-sm text-brown-700 focus:outline-none focus:border-coral-300" />
        </div>

        {/* 背景选择：纯色 + 上传照片 */}
        <p className="text-xs text-brown-400 mb-2">🎨 纯色背景：</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {BG_COLORS.map(c => (
            <button key={c.color} type="button"
              onClick={() => { setBgColor(c.color); setBgImage(''); }}
              className={`w-8 h-8 rounded-full border-2 transition hover:scale-110 ${bgColor === c.color && !bgImage ? 'border-coral-400 scale-110 shadow-md' : 'border-warm-200'}`}
              style={{ backgroundColor: c.color }} title={c.label} />
          ))}
          <span className="text-warm-300 mx-1 self-center">|</span>
          <label className={`px-3 py-1 rounded-full text-xs cursor-pointer transition border ${bgImage ? 'bg-coral-100 border-coral-300 text-coral-500' : 'bg-warm-50 border-warm-200 text-brown-400 hover:border-coral-300'}`}>
            {uploading ? '⏳' : bgImage ? '📸 已选' : '🖼️ 上传背景'}
            <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" disabled={uploading} />
          </label>
          {bgImage && (
            <button type="button" onClick={() => setBgImage('')}
              className="text-xs text-red-400 hover:underline">清除</button>
          )}
        </div>

        {/* 预览区 */}
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="说点什么..."
          className="w-full border border-warm-200 rounded-2xl p-4 text-sm text-brown-700 placeholder-brown-300 focus:outline-none focus:border-coral-300 transition resize-none"
          style={{
            backgroundColor: bgImage ? 'rgba(255,255,255,0.5)' : bgColor,
            backgroundImage: bgImage ? `url(${bgImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay',
          }}
          rows={4} />

        <button type="submit" disabled={submitting || !text.trim()}
          className="mt-3 px-6 py-2.5 bg-coral-400 text-white rounded-full text-sm hover:bg-coral-500 disabled:opacity-40 transition font-medium shadow-md shadow-coral-200">
          {submitting ? '发送中...' : '💕 贴上留言'}
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
        <div className="space-y-3">
          {messages.map((m, i) => (
            <div key={m.id}
              className="rounded-2xl p-5 shadow-card group relative"
              style={{
                backgroundColor: m.bg_image ? 'rgba(255,255,255,0.6)' : (m.bg_color || '#FFF8F0'),
                backgroundImage: m.bg_image ? `url(${m.bg_image})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundBlendMode: 'overlay',
                border: m.bg_image ? '2px solid rgba(255,180,160,0.3)' : '2px solid rgba(255,180,160,0.2)',
              }}>
              {m.bg_image && (
                <div className="absolute inset-0 bg-white/60 rounded-2xl pointer-events-none" />
              )}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-coral-500">{m.author_name}</span>
                    <span className="text-xs text-brown-300">{new Date(m.created_at).toLocaleString('zh-CN')}</span>
                  </div>
                  {isUser && (
                    <button onClick={() => handleDelete(m.id)}
                      className="text-xs text-brown-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition">✕</button>
                  )}
                </div>
                <p className="text-brown-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">{m.content}</p>
              </div>
              <div className="absolute -top-1 -right-1 opacity-20 text-lg select-none pointer-events-none z-20">
                {i % 4 === 0 ? '🌸' : i % 4 === 1 ? '✨' : i % 4 === 2 ? '💕' : '🐾'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
