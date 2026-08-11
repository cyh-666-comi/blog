import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articlesAPI, commentsAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function ArticleDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
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
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await commentsAPI.create(article.id, { content: commentText, parent_id: replyTo, author_name: user?.username || '小可爱' });
      setCommentText(''); setReplyTo(null);
      const res = await commentsAPI.getByArticle(article.id);
      setComments(res.data);
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="animate-spin rounded-full h-7 w-7 border-2 border-coral-200 border-t-coral-400 mx-auto"></div>
    </div>
  );

  if (!article) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center text-brown-400">
      <p className="text-5xl mb-4">🐾</p><p>这篇日记不存在哦~</p>
      <Link to="/" className="text-coral-500 hover:underline mt-4 inline-block">回到首页</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {article.cover_image && (
        <img src={article.cover_image} alt={article.title} className="w-full h-64 md:h-96 object-cover rounded-3xl mb-8 border border-warm-200" />
      )}

      <h1 className="text-3xl md:text-4xl font-bold text-brown-800 mb-4">{article.title}</h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-brown-400 mb-8 pb-8 border-b-2 border-dashed border-warm-200">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-coral-100 flex items-center justify-center text-coral-500 font-bold text-sm border border-coral-200">
            {article.author?.username?.charAt(0)?.toUpperCase()}
          </div>
          <span className="text-brown-600 font-medium">{article.author?.username}</span>
        </div>
        <span>📅 {new Date(article.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        <span>👀 {article.view_count} 次阅读</span>
        {article.category && (
          <Link to={`/?category=${article.category.slug}`} className="bg-coral-50 text-coral-500 px-3 py-1 rounded-full hover:bg-coral-100 transition text-sm border border-coral-200">
            {article.category.name}
          </Link>
        )}
      </div>

      <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />

      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t-2 border-dashed border-warm-200">
          {article.tags.map(tag => (
            <Link key={tag.id} to={`/tag/${tag.slug}`}
              className="text-sm text-brown-400 bg-warm-50 px-3 py-1 rounded-full hover:text-coral-500 hover:bg-coral-50 transition border border-warm-200">
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      <section className="mt-12 pt-8 border-t-2 border-dashed border-warm-200">
        <h2 className="text-xl font-bold text-brown-800 mb-6">💬 留言 ({article.comment_count || 0})</h2>

        <form onSubmit={handleComment} className="mb-8">
          {replyTo && (
            <div className="text-sm text-brown-400 mb-2">
              回复 #{replyTo}
              <button type="button" onClick={() => setReplyTo(null)} className="ml-2 text-coral-400 hover:underline">取消</button>
            </div>
          )}
          <textarea value={commentText} onChange={e => setCommentText(e.target.value)}
            placeholder="写下你想说的话吧..."
            className="w-full bg-warm-50 border border-warm-200 rounded-2xl p-4 text-sm text-brown-700 placeholder-brown-300 focus:outline-none focus:border-coral-300 focus:ring-2 focus:ring-coral-100 transition resize-none"
            rows={3} />
          <button type="submit" disabled={submitting || !commentText.trim()}
            className="mt-3 px-6 py-2.5 bg-coral-400 text-white rounded-full text-sm hover:bg-coral-500 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium shadow-md shadow-coral-200">
            {submitting ? '发送中...' : '💕 发表留言'}
          </button>
        </form>

        {comments.length === 0 ? (
          <p className="text-brown-300 text-center py-8">还没有留言，快来第一个留言吧~ 🐾</p>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="bg-white border border-warm-200 rounded-2xl p-4 shadow-card">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm text-brown-700">{comment.user?.username || comment.author_name}</span>
                  <span className="text-xs text-brown-300">{new Date(comment.created_at).toLocaleString('zh-CN')}</span>
                </div>
                <p className="text-sm text-brown-600">{comment.content}</p>
                <button onClick={() => setReplyTo(comment.id)} className="text-xs text-coral-400 hover:text-coral-500 mt-2 transition">💬 回复</button>
                {comment.replies?.length > 0 && (
                  <div className="ml-6 mt-3 space-y-3 border-l-2 border-warm-200 pl-4">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="bg-warm-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-brown-700">{reply.user?.username || reply.author_name}</span>
                          <span className="text-xs text-brown-300">{new Date(reply.created_at).toLocaleString('zh-CN')}</span>
                        </div>
                        <p className="text-sm text-brown-600">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
