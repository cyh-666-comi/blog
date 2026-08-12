import { useState, useEffect } from 'react';
import { photosAPI, uploadAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { compressImage } from '../utils/compress';

export default function Album() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const { isUser } = useAuth();

  const fetch = () => {
    setLoading(true);
    photosAPI.getList()
      .then(res => setPhotos(res.data))
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleUpload = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true);
    try {
      const compressed = await compressImage(f);
      const r = await uploadAPI.uploadImage(compressed);
      const url = (r.url.startsWith('/') || r.url.startsWith('data:')) ? r.url : `/${r.url}`;
      await photosAPI.create({ url, caption: '' });
      fetch();
    } catch (err) { alert('上传失败: ' + (err.response?.data?.message || err.message)); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定删除这张照片吗？')) return;
    try { await photosAPI.delete(id); fetch(); }
    catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <p className="text-5xl mb-2 animate-wobble inline-block">📸</p>
        <h1 className="text-xl font-bold text-brown-800">我们的相册</h1>
        <p className="text-brown-400 text-sm mt-1">{photos.length} 张照片</p>
        <div className="cute-divider">🌸 📸 🌸</div>
      </div>

      {/* 上传按钮 */}
      {isUser && (
        <div className="text-center mb-6">
          <label className={`inline-block px-5 py-2.5 rounded-full text-sm font-medium cursor-pointer transition shadow-md ${uploading ? 'bg-warm-200 text-brown-400' : 'bg-coral-400 text-white hover:bg-coral-500 shadow-coral-200'}`}>
            {uploading ? '⏳ 上传中...' : '📷 添加照片'}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      )}

      {/* 图片预览弹窗 */}
      {preview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <img src={preview} alt="预览" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl" />
          <button className="absolute top-4 right-4 text-white text-3xl hover:opacity-70">✕</button>
        </div>
      )}

      {/* 照片网格 */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-7 w-7 border-2 border-coral-200 border-t-coral-400"></div></div>
      ) : photos.length === 0 ? (
        <div className="text-center py-20 text-brown-400 bg-white rounded-3xl shadow-card border border-warm-200">
          <p className="text-5xl mb-4">📸</p>
          <p className="text-lg">还没有照片呢~</p>
          <p className="text-sm mt-1">快来添加第一张吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map(p => (
            <div key={p.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-card border border-warm-200 hover:shadow-card-hover transition cursor-pointer">
              <img
                src={p.url}
                alt={p.caption || '照片'}
                className="w-full h-44 object-cover"
                onClick={() => setPreview(p.url)}
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent p-3 opacity-0 group-hover:opacity-100 transition">
                {p.caption && <p className="text-white text-xs truncate">{p.caption}</p>}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-white/80 text-xs">{p.author} · {new Date(p.created_at).toLocaleDateString('zh-CN')}</span>
                  {isUser && (
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                      className="text-white/70 hover:text-red-300 text-xs">删除</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
