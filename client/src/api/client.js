import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器：自动附加 JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：统一处理错误
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 如果不在登录页，跳转到登录页
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    const message = error.response?.data?.message || '请求失败';
    return Promise.reject(new Error(message));
  }
);

// Auth API
export const authAPI = {
  login: (data) => apiClient.post('/auth/login', data),
  register: (data) => apiClient.post('/auth/register', data),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
};

// Articles API
export const articlesAPI = {
  getList: (params) => apiClient.get('/articles', { params }),
  getBySlug: (slug) => apiClient.get(`/articles/${slug}`),
  getById: (id) => apiClient.get(`/articles/id/${id}`),
  getAll: (params) => apiClient.get('/articles/admin/all', { params }),
  create: (data) => apiClient.post('/articles', data),
  update: (id, data) => apiClient.put(`/articles/${id}`, data),
  delete: (id) => apiClient.delete(`/articles/${id}`),
};

// Categories API
export const categoriesAPI = {
  getList: () => apiClient.get('/categories'),
  create: (data) => apiClient.post('/categories', data),
  update: (id, data) => apiClient.put(`/categories/${id}`, data),
  delete: (id) => apiClient.delete(`/categories/${id}`),
};

// Tags API
export const tagsAPI = {
  getList: () => apiClient.get('/tags'),
  create: (data) => apiClient.post('/tags', data),
  createBatch: (data) => apiClient.post('/tags/batch', data),
  update: (id, data) => apiClient.put(`/tags/${id}`, data),
  delete: (id) => apiClient.delete(`/tags/${id}`),
};

// Comments API
export const commentsAPI = {
  getByArticle: (articleId, params) => apiClient.get(`/comments/article/${articleId}`, { params }),
  create: (articleId, data) => apiClient.post(`/comments/article/${articleId}`, data),
  getAll: (params) => apiClient.get('/comments/admin/all', { params }),
  moderate: (id, data) => apiClient.put(`/comments/${id}/moderate`, data),
  delete: (id) => apiClient.delete(`/comments/${id}`),
};

// Upload API
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Messages API
export const messagesAPI = {
  getList: () => apiClient.get('/messages'),
  create: (data) => apiClient.post('/messages', data),
  delete: (id) => apiClient.delete(`/messages/${id}`),
};

// Photos API
export const photosAPI = {
  getList: () => apiClient.get('/photos'),
  create: (data) => apiClient.post('/photos', data),
  delete: (id) => apiClient.delete(`/photos/${id}`),
};

export default apiClient;
