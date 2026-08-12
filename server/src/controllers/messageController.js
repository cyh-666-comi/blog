const { db } = require('../db');

async function getMessages(req, res) {
  const messages = await db.prepare('SELECT id, author_name, content, bg_color, bg_image, font_style, text_color, created_at FROM messages ORDER BY created_at DESC LIMIT 100').all();
  res.json({ data: messages });
}

async function createMessage(req, res) {
  const { author_name, content, bg_color, bg_image, font_style, text_color } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ message: '留言内容不能为空' });
  await db.prepare('INSERT INTO messages (author_name, content, bg_color, bg_image, font_style, text_color) VALUES (?, ?, ?, ?, ?, ?)')
    .run(author_name || '匿名', content.trim(), bg_color || '#FFF8F0', bg_image || '', font_style || '', text_color || '#FFFFFF');
  const messages = await db.prepare('SELECT id, author_name, content, bg_color, bg_image, font_style, text_color, created_at FROM messages ORDER BY created_at DESC LIMIT 100').all();
  res.status(201).json({ data: messages });
}

async function deleteMessage(req, res) {
  await db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
  res.json({ message: '已删除' });
}

module.exports = { getMessages, createMessage, deleteMessage };
