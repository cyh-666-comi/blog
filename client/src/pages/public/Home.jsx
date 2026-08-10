import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { articlesAPI, categoriesAPI, tagsAPI } from '../../api/client';
import ArticleCard from '../../components/ArticleCard';
import Pagination from '../../components/Pagination';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentPage = parseInt(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    setLoading(true);
    articlesAPI.getList({ page: currentPage, category, search })
      .then(res => { setArticles(res.data); setPagination(res.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentPage, category, search]);

  useEffect(() => {
    categoriesAPI.getList().then(res => setCategories(res.data)).catch(() => {});
    tagsAPI.getList().then(res => setTags(res.data)).catch(() => {});
  }, []);

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
    window.scrollTo(0, 0);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-6 text-slate-100">
            {search ? <>搜索: <span className="text-cyan-400">"{search}"</span></>
              : category ? <>分类: <span className="text-cyan-400">{category}</span></>
              : <>最新文章</>
            }
          </h1>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-slate-700 border-t-cyan-500"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20 text-slate-600">
              <p className="text-5xl mb-4">📝</p>
              <p>暂无文章</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                {articles.map(article => <ArticleCard key={article.id} article={article} />)}
              </div>
              <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </div>

        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
            <h3 className="font-semibold text-slate-200 mb-3">📁 分类</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className={`text-sm block transition ${!category ? 'text-cyan-400 font-medium' : 'text-slate-400 hover:text-cyan-400'}`}>
                  全部 ({pagination.total})
                </a>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <a href={`/?category=${cat.slug}`} className={`text-sm block transition ${category === cat.slug ? 'text-cyan-400 font-medium' : 'text-slate-400 hover:text-cyan-400'}`}>
                    {cat.name} ({cat.article_count})
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="font-semibold text-slate-200 mb-3">🏷️ 标签</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <a key={tag.id} href={`/tag/${tag.slug}`}
                  className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full hover:text-cyan-400 hover:bg-slate-700 transition">
                  #{tag.name}
                </a>
              ))}
              {tags.length === 0 && <span className="text-sm text-slate-600">暂无标签</span>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
