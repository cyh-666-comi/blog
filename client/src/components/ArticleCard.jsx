import { Link } from 'react-router-dom';

export default function ArticleCard({ article }) {
  return (
    <article className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/30 hover:shadow-lg transition-all duration-300 group">
      {article.cover_image && (
        <Link to={`/article/${article.slug}`}>
          <img src={article.cover_image} alt={article.title} className="w-full h-48 object-cover" />
        </Link>
      )}
      <div className="p-5">
        {article.category && (
          <Link
            to={`/category/${article.category.slug}`}
            className="text-xs font-medium text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full hover:bg-cyan-500/20 transition"
          >
            {article.category.name}
          </Link>
        )}
        {article.is_top === 1 && (
          <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full ml-2">置顶</span>
        )}
        <Link to={`/article/${article.slug}`}>
          <h2 className="text-lg font-semibold text-slate-100 mt-2 group-hover:text-cyan-400 transition line-clamp-2">
            {article.title}
          </h2>
        </Link>
        {article.summary && (
          <p className="text-slate-400 text-sm mt-2 line-clamp-3 leading-relaxed">{article.summary}</p>
        )}
        <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
          <div className="flex items-center space-x-3">
            <span className="text-slate-400">{article.author?.username}</span>
            <span>{new Date(article.created_at).toLocaleDateString('zh-CN')}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span>👁 {article.view_count}</span>
            <span>💬 {article.comment_count}</span>
          </div>
        </div>
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {article.tags.map(tag => (
              <Link
                key={tag.id}
                to={`/tag/${tag.slug}`}
                className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full hover:text-cyan-400 hover:bg-slate-700 transition"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
