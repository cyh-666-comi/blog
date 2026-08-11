const { db } = require('../db');
const { paginate, paginatedResponse } = require('../utils/helpers');

async function getComments(req, res) {
  const { articleId } = req.params;
  const { page, pageSize } = req.query;
  const { offset, limit, page: p, pageSize: ps } = paginate(page, pageSize);

  const total = (await db.prepare("SELECT COUNT(*) as count FROM comments WHERE article_id = ? AND status = 'approved' AND parent_id IS NULL").get(articleId))?.count || 0;

  const comments = await db.prepare(`
    SELECT c.id, c.content, c.author_name, c.status, c.created_at,
      CASE WHEN c.user_id IS NOT NULL THEN json_object('id', u.id, 'username', u.username, 'avatar', u.avatar) ELSE NULL END as user
    FROM comments c LEFT JOIN users u ON c.user_id = u.id
    WHERE c.article_id = ? AND c.status = 'approved' AND c.parent_id IS NULL
    ORDER BY c.created_at DESC LIMIT ? OFFSET ?
  `).all(articleId, limit, offset);

  const result = [];
  for (const c of comments) {
    const replies = await db.prepare(`
      SELECT c2.id, c2.content, c2.author_name, c2.created_at,
        CASE WHEN c2.user_id IS NOT NULL THEN json_object('id', u.id, 'username', u.username, 'avatar', u.avatar) ELSE NULL END as user
      FROM comments c2 LEFT JOIN users u ON c2.user_id = u.id
      WHERE c2.parent_id = ? AND c2.status = 'approved' ORDER BY c2.created_at ASC
    `).all(c.id);
    result.push({
      ...c,
      user: c.user ? JSON.parse(c.user) : null,
      replies: replies.map(r => ({ ...r, user: r.user ? JSON.parse(r.user) : null })),
    });
  }

  res.json(paginatedResponse(result, total, p, ps));
}

async function createComment(req, res) {
  const { articleId } = req.params;
  const { content, parent_id, author_name } = req.body;
  const article = await db.prepare('SELECT id FROM articles WHERE id = ?').get(articleId);
  if (!article) return res.status(404).json({ message: '文章不存在' });

  await db.prepare('INSERT INTO comments (content, article_id, user_id, parent_id, author_name, status) VALUES (?, ?, ?, ?, ?, ?)')
    .run(content, articleId, req.user?.id || null, parent_id || null, author_name || '匿名', 'approved');

  const newComment = await db.prepare('SELECT * FROM comments ORDER BY id DESC LIMIT 1').get();
  res.status(201).json(newComment);
}

async function getAllComments(req, res) {
  const { page, pageSize, status } = req.query;
  const { offset, limit, page: p, pageSize: ps } = paginate(page, pageSize);

  let where = 'WHERE 1=1';
  const params = [];
  if (status) { where += ' AND c.status = ?'; params.push(status); }

  const total = (await db.prepare(`SELECT COUNT(*) as count FROM comments c ${where}`).get(...params))?.count || 0;

  const comments = await db.prepare(`
    SELECT c.*, a.title as article_title, a.slug as article_slug,
      CASE WHEN c.user_id IS NOT NULL THEN u.username ELSE c.author_name END as author_display
    FROM comments c LEFT JOIN articles a ON c.article_id = a.id LEFT JOIN users u ON c.user_id = u.id
    ${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  res.json(paginatedResponse(comments, total, p, ps));
}

async function moderateComment(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  if (!['pending', 'approved', 'rejected'].includes(status)) return res.status(400).json({ message: '无效的审核状态' });
  await db.prepare('UPDATE comments SET status = ? WHERE id = ?').run(status, id);
  const updated = await db.prepare('SELECT * FROM comments WHERE id = ?').get(id);
  res.json(updated);
}

async function deleteComment(req, res) {
  const { id } = req.params;
  await db.prepare('DELETE FROM comments WHERE id = ? OR parent_id = ?').run(id, id);
  res.json({ message: '评论已删除' });
}

module.exports = { getComments, createComment, getAllComments, moderateComment, deleteComment };
