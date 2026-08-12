const { db } = require('../db');

async function getPhotos(req, res) {
  const photos = await db.prepare(
    'SELECT p.id, p.url, p.caption, p.created_at, u.username as author FROM photos p LEFT JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC'
  ).all();
  res.json({ data: photos });
}

async function createPhoto(req, res) {
  const { url, caption } = req.body;
  if (!url) return res.status(400).json({ message: '请提供图片' });
  await db.prepare('INSERT INTO photos (url, caption, user_id) VALUES (?, ?, ?)').run(url, caption || '', req.user.id);
  const photos = await db.prepare(
    'SELECT p.id, p.url, p.caption, p.created_at, u.username as author FROM photos p LEFT JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC'
  ).all();
  res.status(201).json({ data: photos });
}

async function deletePhoto(req, res) {
  await db.prepare('DELETE FROM photos WHERE id = ?').run(req.params.id);
  res.json({ message: '已删除' });
}

module.exports = { getPhotos, createPhoto, deletePhoto };
