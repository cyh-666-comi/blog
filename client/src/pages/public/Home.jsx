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

  useEffect(() => {
    setLoading(true);
    articlesAPI.getList({ page: currentPage, category })
      .then(res => { setArticles(res.data); setPagination(res.pagination); })
      .catch(console.error).finally(() => setLoading(false));
  }, [currentPage, category]);

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
      <div className="text-center mb-10">
        <p className="text-5xl mb-3">🐕</p>
        <h1 className="text-3xl font-bold text-brown-800">我们的恋爱日记</h1>
        <p className="text-brown-400 mt-2 text-sm">记录 cyh ♥ frz 的点滴瞬间</p>
        <div className="mt-3 flex justify-center gap-3">
          <span className="text-xs text-brown-300 bg-warm-100 px-3 py-1 rounded-full">🌸 {pagination.total} 篇日记</span>
          <span className="text-xs text-brown-300 bg-warm-100 px-3 py-1 rounded-full">🐾 每一天都值得</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-coral-200 border-t-coral-400"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20 text-brown-300">
              <p className="text-5xl mb-4">📖</p>
              <p>还没有写日记呢~</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                {articles.map(a => <ArticleCard key={a.id} article={a} />)}
              </div>
              <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </div>

        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-3xl shadow-card p-5 mb-6 border border-warm-100">
            <h3 className="font-semibold text-brown-800 mb-3">📂 分类</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className={`text-sm block transition ${!category ? 'text-coral-500 font-medium' : 'text-brown-400 hover:text-coral-500'}`}>
                  🐾 全部 ({pagination.total})
                </a>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <a href={`/?category=${cat.slug}`} className={`text-sm block transition ${category === cat.slug ? 'text-coral-500 font-medium' : 'text-brown-400 hover:text-coral-500'}`}>
                    {cat.name} ({cat.article_count})
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl shadow-card p-5 border border-warm-100">
            <h3 className="font-semibold text-brown-800 mb-3">🏷️ 标签</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <a key={tag.id} href={`/tag/${tag.slug}`}
                  className="text-xs text-brown-400 bg-warm-50 px-2.5 py-1 rounded-full hover:text-coral-500 hover:bg-coral-50 transition border border-warm-200">
                  #{tag.name}
                </a>
              ))}
              {tags.length === 0 && <span className="text-sm text-brown-300">还没有标签~</span>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
