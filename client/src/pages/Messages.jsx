import { useState, useEffect } from 'react';
import { messagesAPI, uploadAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { compressImage } from '../utils/compress';

const FONTS = [
  { value: '', label: '默认', family: 'inherit' },
  { value: 'kaiti', label: '楷体', family: '"KaiTi", "STKaiti", serif' },
  { value: 'songti', label: '宋体', family: '"SimSun", "STSong", serif' },
  { value: 'yahei', label: '雅黑', family: '"Microsoft YaHei", "PingFang SC", sans-serif' },
  { value: 'shouxie', label: '手写', family: '"Comic Sans MS", "Segoe Script", cursive' },
  { value: 'yuanti', label: '圆体', family: '"Yuanti SC", "YouYuan", "幼圆", sans-serif' },
  { value: 'heiti', label: '黑体', family: '"SimHei", "STHeiti", sans-serif' },
];

const TEXT_COLORS = [
  { color: '#FFFFFF', label: '白' },
  { color: '#FFD1DC', label: '粉' },
  { color: '#FFE4B5', label: '杏' },
  { color: '#B0E0E6', label: '蓝' },
  { color: '#98FB98', label: '绿' },
  { color: '#FFD700', label: '金' },
  { color: '#FF7F50', label: '橙' },
  { color: '#DDA0DD', label: '紫' },
  { color: '#3E2723', label: '深棕' },
];

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [bgImage, setBgImage] = useState('');
  const [fontStyle, setFontStyle] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
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
        font_style: fontStyle,
        text_color: textColor,
      });
      setText(''); setBgImage(''); setFontStyle(''); setTextColor('#FFFFFF');
      fetch();
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  const currentFont = FONTS.find(f => f.value === fontStyle)?.family || 'inherit';

  return (
    <div className="w-full">
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

        {/* 字体选择 */}
        <p className="text-xs text-brown-400 mb-2">✍️ 字体：</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {FONTS.map(f => (
            <button key={f.value} type="button"
              onClick={() => setFontStyle(f.value)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${fontStyle === f.value ? 'bg-coral-400 text-white border-coral-400' : 'bg-warm-50 text-brown-500 border-warm-200 hover:border-coral-300'}`}
              style={{ fontFamily: f.family }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* 颜色选择 */}
        <p className="text-xs text-brown-400 mb-2">🎨 文字颜色：</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {TEXT_COLORS.map(c => (
            <button key={c.color} type="button"
              onClick={() => setTextColor(c.color)}
              className={`w-8 h-8 rounded-full border-2 transition hover:scale-110 ${textColor === c.color ? 'border-coral-400 scale-110 shadow-md' : 'border-warm-200'}`}
              style={{ backgroundColor: c.color }} title={c.label} />
          ))}
        </div>

        {/* 预览 */}
        <div className="relative rounded-2xl overflow-hidden mb-3">
          {!bgImage ? (
            <div className="min-h-[140px] flex items-center justify-center bg-warm-100 text-brown-300 text-sm">
              📸 请先选择一张背景照片
            </div>
          ) : (
            <>
              <img src={bgImage} alt="背景" className="w-full h-auto block" />
              <div className="absolute inset-0 flex items-center justify-center">
                <textarea value={text} onChange={e => setText(e.target.value)}
                  placeholder="说点什么..."
                  className="w-full bg-transparent text-lg md:text-2xl text-center placeholder-white/60 focus:outline-none resize-none font-bold px-6"
                  style={{ color: textColor, textShadow: '0 2px 6px rgba(0,0,0,0.6)', fontFamily: currentFont }}
                  rows={3} />
              </div>
            </>
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
          {messages.map((m, i) => {
            const font = FONTS.find(f => f.value === m.font_style)?.family || 'inherit';
            return (
              <div key={m.id} className="relative rounded-2xl overflow-hidden shadow-md group w-full">
                {m.bg_image ? (
                  <>
                    <img src={m.bg_image} alt={m.author_name} className="w-full h-auto block" />
                    <div className="absolute top-3 left-4 z-20 flex items-center gap-2">
                      <span className="font-bold text-sm"
                        style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{m.author_name}</span>
                      <span className="text-xs"
                        style={{ color: 'rgba(255,255,255,0.75)', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                        {new Date(m.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    {isUser && (
                      <button onClick={() => handleDelete(m.id)}
                        className="absolute bottom-3 right-4 z-20 text-xs text-white/50 hover:text-red-300 opacity-0 group-hover:opacity-100 transition">✕</button>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      <p className="text-lg md:text-2xl lg:text-3xl leading-relaxed whitespace-pre-wrap font-bold text-center max-w-2xl"
                        style={{
                          color: m.text_color || '#FFFFFF',
                          textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.4)',
                          fontFamily: font,
                        }}>
                        {m.content}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="min-h-[200px] flex items-center justify-center p-6"
                    style={{ backgroundColor: m.bg_color || '#FFF8F0' }}>
                    <p className="text-lg text-brown-700 text-center whitespace-pre-wrap" style={{ fontFamily: font, color: m.text_color === '#FFFFFF' ? '#5D4037' : m.text_color }}>
                      {m.content}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
