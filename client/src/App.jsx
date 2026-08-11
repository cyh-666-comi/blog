import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';

import Login from './pages/Login';
import Home from './pages/Home';
import DiaryDetail from './pages/DiaryDetail';
import Messages from './pages/Messages';
import DiaryEditor from './pages/admin/DiaryEditor';
import DiaryList from './pages/admin/DiaryList';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/diary/:slug" element={<DiaryDetail />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/admin/diaries" element={<DiaryList />} />
        <Route path="/admin/diaries/new" element={<DiaryEditor />} />
        <Route path="/admin/diaries/:id/edit" element={<DiaryEditor />} />
      </Route>
    </Routes>
  );
}
