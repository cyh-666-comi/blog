import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articlesAPI, commentsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function DiaryDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState(user?.username || '');
  const [replyTo, setReplyTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    articlesAPI.getBySlug(slug)
      .then(data => { setArticle(data); return commentsAPI.getByArticle(data.id); })
      .then(res => setComments(res.data))
      .catch(console.error).finally(() => setLoading(false));
  }, [slug]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await commentsAPI.create(article.id, { content: text, parent_id: replyTo, author_name: author || '匿名' });
      setText(''); setReplyTo(null);
      const res = await commentsAPI.getByArticle(article.id);
      setComments(res.data);
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-7 w-7 border-2 border-coral-200 border-t-coral-400"></div></div>
  );

  if (!article) return (
    <div className="text-center py-20 text-brown-400"><p className="text-5xl mb-4">🐾</p><p>日记不存在</p><Link to="/home" className="text-coral-500 hover:underline mt-4 inline-block">返回</Link></div>
  );

  return (
    <div>
      <Link to="/home" className="text-brown-400 hover:text-coral-500 text-sm mb-4 inline-block transition">← 返回日记列表</Link>

      {article.cover_image && (
        <img src={article.cover_image} alt={article.title} className="w-full h-64 md:h-80 object-cover rounded-3xl my-4 border border-warm-200" />
      )}

      <h1 className="text-2xl md:text-3xl font-bold text-brown-800 mb-3">{article.title}</h1>

      <div className="flex items-center gap-4 text-sm text-brown-400 mb-8 pb-6 border-b-2 border-dashed border-warm-200">
        <span className="text-brown-600 font-medium">✍️ {article.author?.username}</span>
        <span>📅 {new Date(article.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        <span>👀 {article.view_count}</span>
      </div>

      <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />

      {/* 评论区 */}
      <div className="mt-12 pt-8 border-t-2 border-dashed border-warm-200">
        <h2 className="text-xl font-bold text-brown-800 mb-6">💬 评论 ({article.comment_count || 0})</h2>

        <form onSubmit={handleComment} className="mb-8 bg-white border border-warm-200 rounded-2xl p-4 shadow-card">
          {replyTo && (
            <div className="text-sm text-brown-400 mb-2">回复 #{replyTo} <button type="button" onClick={() => setReplyTo(null)} className="ml-2 text-coral-400">取消</button></div>
          )}
          <div className="flex gap-3 mb-3">
            <input type="text" value={author} onChange={e => setAuthor(e.target.value)}
              placeholder="你的名字" className="w-28 px-3 py-1.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-brown-700 focus:outline-none focus:border-coral-300" />
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="写下你的评论..."
            className="w-full bg-warm-50 border border-warm-200 rounded-xl p-3 text-sm text-brown-700 focus:outline-none focus:border-coral-300 transition resize-none" rows={2} />
          <button type="submit" disabled={submitting || !text.trim()}
            className="mt-2 px-5 py-2 bg-coral-400 text-white rounded-full text-sm hover:bg-coral-500 disabled:opacity-40 transition">💕 发表</button>
        </form>

        {comments.length === 0 ? (
          <p className="text-brown-300 text-center py-6">还没有评论~</p>
        ) : (
          <div className="space-y-3">
            {comments.map(c => (
              <div key={c.id} className="bg-white border border-warm-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-brown-700">{c.user?.username || c.author_name}</span>
                  <span className="text-xs text-brown-300">{new Date(c.created_at).toLocaleString('zh-CN')}</span>
                </div>
                <p className="text-sm text-brown-600">{c.content}</p>
                <button onClick={() => setReplyTo(c.id)} className="text-xs text-coral-400 hover:text-coral-500 mt-2">💬 回复</button>
                {c.replies?.length > 0 && (
                  <div className="ml-6 mt-3 space-y-2 border-l-2 border-warm-200 pl-4">
                    {c.replies.map(r => (
                      <div key={r.id} className="bg-warm-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-brown-700">{r.user?.username || r.author_name}</span>
                          <span className="text-xs text-brown-300">{new Date(r.created_at).toLocaleString('zh-CN')}</span>
                        </div>
                        <p className="text-sm text-brown-600">{r.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
