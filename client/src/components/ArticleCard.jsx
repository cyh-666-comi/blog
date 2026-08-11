import { Link } from 'react-router-dom';

export default function ArticleCard({ article }) {
  return (
    <article className="bg-white rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group hover:-translate-y-1 border border-warm-100">
      {article.cover_image && (
        <Link to={`/article/${article.slug}`}>
          <img src={article.cover_image} alt={article.title} className="w-full h-48 object-cover" />
        </Link>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {article.category && (
            <Link to={`/category/${article.category.slug}`}
              className="text-xs font-medium text-coral-500 bg-coral-50 px-2.5 py-1 rounded-full hover:bg-coral-100 transition border border-coral-200">
              {article.category.name}
            </Link>
          )}
          {article.is_top === 1 && (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">📌 置顶</span>
          )}
        </div>
        <Link to={`/article/${article.slug}`}>
          <h2 className="text-lg font-semibold text-brown-800 mt-1 group-hover:text-coral-500 transition line-clamp-2">
            {article.title}
          </h2>
        </Link>
        {article.summary && (
          <p className="text-brown-400 text-sm mt-2 line-clamp-3 leading-relaxed">{article.summary}</p>
        )}
        <div className="flex items-center justify-between mt-4 text-xs text-brown-300">
          <div className="flex items-center space-x-3">
            <span className="text-brown-400 font-medium">✍️ {article.author?.username}</span>
            <span>{new Date(article.created_at).toLocaleDateString('zh-CN')}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span>👀 {article.view_count}</span>
            <span>💬 {article.comment_count}</span>
          </div>
        </div>
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-dashed border-warm-200">
            {article.tags.map(tag => (
              <Link key={tag.id} to={`/tag/${tag.slug}`}
                className="text-xs text-brown-400 bg-warm-50 px-2 py-0.5 rounded-full hover:text-coral-500 hover:bg-coral-50 transition">
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
