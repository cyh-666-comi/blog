const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', [
  body('username').trim().isLength({ min: 2, max: 30 }).withMessage('用户名需要2-30个字符'),
  body('email').isEmail().withMessage('请输入有效的邮箱'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6个字符'),
], register);

// POST /api/auth/login
router.post('/login', [
  body('username').trim().notEmpty().withMessage('请输入用户名或邮箱'),
  body('password').notEmpty().withMessage('请输入密码'),
], login);

// GET /api/auth/me
router.get('/me', authenticate, getMe);

// PUT /api/auth/profile
router.put('/profile', authenticate, updateProfile);

module.exports = router;
