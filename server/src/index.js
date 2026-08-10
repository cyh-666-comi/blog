require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db');
const { errorHandler, notFound } = require('./middleware/error');

// 初始化数据库
initDatabase();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（上传的图片）
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 静态文件服务（前端构建产物）
const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// API 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/upload', require('./routes/upload'));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback —— 所有非 API 路由返回前端 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// 错误处理
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 博客后端服务已启动: http://localhost:${PORT}`);
  console.log(`📝 API 文档:`);
  console.log(`   GET  /api/health          — 健康检查`);
  console.log(`   POST /api/auth/register    — 用户注册`);
  console.log(`   POST /api/auth/login       — 用户登录`);
  console.log(`   GET  /api/articles         — 文章列表`);
  console.log(`   GET  /api/articles/:slug   — 文章详情`);
  console.log(`   GET  /api/categories       — 分类列表`);
  console.log(`   GET  /api/tags             — 标签列表`);
  console.log(`   GET  /api/comments/article/:id — 文章评论`);
  console.log(`   POST /api/upload           — 上传图片\n`);
});
