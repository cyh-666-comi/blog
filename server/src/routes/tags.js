const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getTags, createTag, createTagsBatch, updateTag, deleteTag } = require('../controllers/tagController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// 公开接口
router.get('/', getTags);

// 管理接口
router.post('/', authenticate, requireAdmin, [
  body('name').trim().isLength({ min: 1 }).withMessage('标签名不能为空'),
], createTag);
router.post('/batch', authenticate, requireAdmin, createTagsBatch);
router.put('/:id', authenticate, requireAdmin, updateTag);
router.delete('/:id', authenticate, requireAdmin, deleteTag);

module.exports = router;
