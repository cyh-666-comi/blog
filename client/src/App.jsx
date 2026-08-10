import { Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';

// 公共页面
import Home from './pages/public/Home';
import ArticleDetail from './pages/public/ArticleDetail';
import CategoryPage from './pages/public/CategoryPage';
import TagPage from './pages/public/TagPage';

// 管理页面
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ArticleList from './pages/admin/ArticleList';
import ArticleEditor from './pages/admin/ArticleEditor';
import Categories from './pages/admin/Categories';
import Tags from './pages/admin/Tags';
import Comments from './pages/admin/Comments';

export default function App() {
  return (
    <Routes>
      {/* 前台博客 */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/article/:slug" element={<ArticleDetail />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/tag/:slug" element={<TagPage />} />
      </Route>

      {/* 后台管理 */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/articles" element={<ArticleList />} />
        <Route path="/admin/articles/new" element={<ArticleEditor />} />
        <Route path="/admin/articles/:id/edit" element={<ArticleEditor />} />
        <Route path="/admin/categories" element={<Categories />} />
        <Route path="/admin/tags" element={<Tags />} />
        <Route path="/admin/comments" element={<Comments />} />
      </Route>
    </Routes>
  );
}
