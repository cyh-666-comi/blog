const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// 公开接口
router.get('/', getCategories);

// 管理接口
router.post('/', authenticate, requireAdmin, [
  body('name').trim().isLength({ min: 1 }).withMessage('分类名不能为空'),
], createCategory);
router.put('/:id', authenticate, requireAdmin, updateCategory);
router.delete('/:id', authenticate, requireAdmin, deleteCategory);

module.exports = router;
