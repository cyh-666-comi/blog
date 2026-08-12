import { useState, useEffect } from 'react';
import { messagesAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => { setAuthor(user?.username || ''); }, [user]);

  const fetch = () => {
    messagesAPI.getList()
      .then(res => setMessages(res.data))
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await messagesAPI.create({ content: text, author_name: author || '匿名' });
      setText('');
      fetch();
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <p className="text-5xl mb-2 animate-wobble inline-block">💬</p>
        <h1 className="text-xl font-bold text-brown-800">留言板</h1>
        <p className="text-brown-400 text-sm mt-1">留下你想说的话吧~ ✨</p>
        <div className="cute-divider">🌸 💕 🌸</div>
      </div>

      {/* 发留言 */}
      <form onSubmit={handleSubmit} className="bg-white border border-warm-200 rounded-2xl p-4 shadow-card mb-8">
        <div className="flex gap-3 mb-3">
          <input type="text" value={author} onChange={e => setAuthor(e.target.value)}
            placeholder="你的名字" className="w-32 px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl text-sm text-brown-700 focus:outline-none focus:border-coral-300" />
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="说点什么..."
          className="w-full bg-warm-50 border border-warm-200 rounded-xl p-4 text-sm text-brown-700 focus:outline-none focus:border-coral-300 transition resize-none" rows={3} />
        <button type="submit" disabled={submitting || !text.trim()}
          className="mt-3 px-6 py-2.5 bg-coral-400 text-white rounded-full text-sm hover:bg-coral-500 disabled:opacity-40 transition font-medium shadow-md shadow-coral-200">
          {submitting ? '发送中...' : '💕 留言'}
        </button>
      </form>

      {/* 留言列表 */}
      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-7 w-7 border-2 border-coral-200 border-t-coral-400"></div></div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16 text-brown-400 bg-white rounded-3xl shadow-card border border-warm-200">
          <p className="text-5xl mb-4 animate-wobble inline-block">📭</p>
          <p className="text-lg">还没有留言呢~</p>
          <p className="text-sm mt-1">来做第一颗小星星吧 ✨</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map(m => (
            <div key={m.id} className="bg-white border border-warm-200 rounded-2xl p-5 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm text-coral-500">{m.author_name}</span>
                <span className="text-xs text-brown-300">{new Date(m.created_at).toLocaleString('zh-CN')}</span>
              </div>
              <p className="text-brown-600 text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
