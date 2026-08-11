import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { articlesAPI, categoriesAPI } from '../../api/client';
import ArticleCard from '../../components/ArticleCard';
import Pagination from '../../components/Pagination';

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentPage = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    setLoading(true);
    articlesAPI.getList({ page: currentPage, category: slug })
      .then(res => { setArticles(res.data); setPagination(res.pagination); })
      .finally(() => setLoading(false));
    categoriesAPI.getList().then(res => setCategory(res.data.find(c => c.slug === slug))).catch(() => {});
  }, [slug, currentPage]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brown-800 mb-2">📂 {category?.name || slug}</h1>
      {category?.description && <p className="text-brown-400 mb-6">{category.description}</p>}
      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-7 w-7 border-2 border-coral-200 border-t-coral-400"></div></div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-brown-400">还没有日记~</div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">{articles.map(a => <ArticleCard key={a.id} article={a} />)}</div>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={p => { setSearchParams({ page: p }); window.scrollTo(0, 0); }} />
        </>
      )}
    </div>
  );
}
