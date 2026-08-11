const { db } = require('../db');

async function getMessages(req, res) {
  const messages = await db.prepare('SELECT id, author_name, content, created_at FROM messages ORDER BY created_at DESC LIMIT 100').all();
  res.json({ data: messages });
}

async function createMessage(req, res) {
  const { author_name, content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ message: '留言内容不能为空' });
  await db.prepare('INSERT INTO messages (author_name, content) VALUES (?, ?)').run(author_name || '匿名', content.trim());
  const messages = await db.prepare('SELECT id, author_name, content, created_at FROM messages ORDER BY created_at DESC LIMIT 100').all();
  res.status(201).json({ data: messages });
}

module.exports = { getMessages, createMessage };
