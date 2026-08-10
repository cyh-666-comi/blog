const express = require('express');
const router = express.Router();
const { upload, uploadImage } = require('../controllers/uploadController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// POST /api/upload — 上传图片（需要管理员登录）
router.post('/', authenticate, requireAdmin, upload.single('image'), uploadImage);

module.exports = router;
