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
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await commentsAPI.create(article.id, { content: commentText, parent_id: replyTo, author_name: user?.username || '匿名' });
      setCommentText(''); setReplyTo(null);
      const res = await commentsAPI.getByArticle(article.id);
      setComments(res.data);
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="animate-spin rounded-full h-7 w-7 border-2 border-slate-700 border-t-cyan-500 mx-auto"></div>
    </div>
  );

  if (!article) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center text-slate-500">
      <p className="text-5xl mb-4">🔍</p>
      <p>文章不存在</p>
      <Link to="/" className="text-cyan-400 hover:underline mt-4 inline-block">返回首页</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {article.cover_image && (
        <img src={article.cover_image} alt={article.title} className="w-full h-64 md:h-96 object-cover rounded-2xl mb-8" />
      )}

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{article.title}</h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-8 pb-8 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-sm">
            {article.author?.username?.charAt(0)?.toUpperCase()}
          </div>
          <span className="text-slate-300">{article.author?.username}</span>
        </div>
        <span>📅 {new Date(article.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        <span>👁 {article.view_count} 阅读</span>
        {article.category && (
          <Link to={`/?category=${article.category.slug}`} className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full hover:bg-cyan-500/20 transition text-sm">
            {article.category.name}
          </Link>
        )}
      </div>

      <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />

      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-slate-800">
          {article.tags.map(tag => (
            <Link key={tag.id} to={`/tag/${tag.slug}`}
              className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full hover:text-cyan-400 hover:bg-slate-700 transition">
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      <section className="mt-12 pt-8 border-t border-slate-800">
        <h2 className="text-xl font-bold text-slate-200 mb-6">💬 评论 ({article.comment_count || 0})</h2>

        <form onSubmit={handleComment} className="mb-8">
          {replyTo && (
            <div className="text-sm text-slate-400 mb-2">
              回复评论 #{replyTo}
              <button type="button" onClick={() => setReplyTo(null)} className="ml-2 text-red-400 hover:underline">取消</button>
            </div>
          )}
          <textarea value={commentText} onChange={e => setCommentText(e.target.value)}
            placeholder={user ? "写下你的评论..." : "写下你的评论（将以匿名身份发表）..."}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition resize-none"
            rows={3} />
          <button type="submit" disabled={submitting || !commentText.trim()}
            className="mt-2 px-5 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium">
            {submitting ? '提交中...' : '发表评论'}
          </button>
        </form>

        {comments.length === 0 ? (
          <p className="text-slate-600 text-center py-8">暂无评论，来抢沙发吧~</p>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm text-slate-200">{comment.user?.username || comment.author_name}</span>
                  <span className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleString('zh-CN')}</span>
                </div>
                <p className="text-sm text-slate-400">{comment.content}</p>
                <button onClick={() => setReplyTo(comment.id)} className="text-xs text-slate-500 hover:text-cyan-400 mt-2 transition">回复</button>
                {comment.replies?.length > 0 && (
                  <div className="ml-6 mt-3 space-y-3 border-l-2 border-slate-700 pl-4">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="bg-slate-800 rounded p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-slate-200">{reply.user?.username || reply.author_name}</span>
                          <span className="text-xs text-slate-500">{new Date(reply.created_at).toLocaleString('zh-CN')}</span>
                        </div>
                        <p className="text-sm text-slate-400">{reply.content}</p>
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
