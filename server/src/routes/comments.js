const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getComments, createComment, getAllComments, moderateComment, deleteComment } = require('../controllers/commentController');
const { authenticate, optionalAuth, requireAdmin } = require('../middleware/auth');

// 公开接口
router.get('/article/:articleId', getComments);
router.post('/article/:articleId', optionalAuth, [
  body('content').trim().isLength({ min: 1 }).withMessage('评论内容不能为空'),
], createComment);

// 管理接口
router.get('/admin/all', authenticate, requireAdmin, getAllComments);
router.put('/:id/moderate', authenticate, requireAdmin, moderateComment);
router.delete('/:id', authenticate, requireAdmin, deleteComment);

module.exports = router;
