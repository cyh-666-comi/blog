const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getArticles, getAllArticles, getArticleBySlug, getArticleById,
  createArticle, updateArticle, deleteArticle,
} = require('../controllers/articleController');
const { authenticate, optionalAuth, requireAdmin } = require('../middleware/auth');

// 管理接口（必须放在 :slug 之前，避免路由冲突）
router.get('/admin/all', authenticate, requireAdmin, getAllArticles);

// 公开接口
router.get('/', getArticles);
// 按 ID 获取（仅管理员，用于编辑）
router.get('/id/:id', authenticate, requireAdmin, getArticleById);
// 按 slug 获取（公开）
router.get('/:slug', optionalAuth, getArticleBySlug);

// 管理接口（写操作）
router.post('/', authenticate, requireAdmin, [
  body('title').trim().isLength({ min: 1 }).withMessage('标题不能为空'),
  body('content').optional().trim(),
], createArticle);
router.put('/:id', authenticate, requireAdmin, updateArticle);
router.delete('/:id', authenticate, requireAdmin, deleteArticle);

module.exports = router;
