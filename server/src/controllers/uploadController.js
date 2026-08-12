const multer = require('multer');
const fs = require('fs');

// 内存存储，文件转为 base64
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('仅支持图片: jpg, png, gif, webp, svg'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// 上传图片 → 返回 base64 data URL（可直接嵌入文章，永久保存）
function uploadImage(req, res) {
  if (!req.file) return res.status(400).json({ message: '请选择文件' });
  const b64 = req.file.buffer.toString('base64');
  const dataUrl = `data:${req.file.mimetype};base64,${b64}`;
  res.json({ url: dataUrl, filename: req.file.originalname });
}

module.exports = { upload, uploadImage };
