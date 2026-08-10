const { db } = require('../db');
const { paginate, paginatedResponse } = require('../utils/helpers');

// 获取文章评论
function getComments(req, res) {
  const { articleId } = req.params;
  const { page, pageSize } = req.query;
  const { offset, limit, page: p, pageSize: ps } = paginate(page, pageSize);

  const total = db.prepare(
    "SELECT COUNT(*) as count FROM comments WHERE article_id = ? AND status = 'approved' AND parent_id IS NULL"
  ).get(articleId).count;

  // 获取顶级评论
  const comments = db.prepare(`
    SELECT c.id, c.content, c.author_name, c.status, c.created_at,
      CASE WHEN c.user_id IS NOT NULL THEN json_object('id', u.id, 'username', u.username, 'avatar', u.avatar) ELSE NULL END as user
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.article_id = ? AND c.status = 'approved' AND c.parent_id IS NULL
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `).all(articleId, limit, offset);

  // 获取每条评论的回复
  const commentsWithReplies = comments.map(comment => {
    const replies = db.prepare(`
      SELECT c.id, c.content, c.author_name, c.created_at,
        CASE WHEN c.user_id IS NOT NULL THEN json_object('id', u.id, 'username', u.username, 'avatar', u.avatar) ELSE NULL END as user
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.parent_id = ? AND c.status = 'approved'
      ORDER BY c.created_at ASC
    `).all(comment.id);

    return {
      ...comment,
      user: comment.user ? JSON.parse(comment.user) : null,
      replies: replies.map(r => ({ ...r, user: r.user ? JSON.parse(r.user) : null })),
    };
  });

  res.json(paginatedResponse(commentsWithReplies, total, p, ps));
}

// 创建评论
function createComment(req, res) {
  const { articleId } = req.params;
  const { content, parent_id, author_name } = req.body;

  const article = db.prepare("SELECT id, status FROM articles WHERE id = ? AND status = 'published'").get(articleId);
  if (!article) {
    return res.status(404).json({ message: '文章不存在' });
  }

  const status = 'approved'; // 默认自动通过，生产环境可改为 'pending'
  const userId = req.user ? req.user.id : null;

  const result = db.prepare(
    'INSERT INTO comments (content, article_id, user_id, parent_id, author_name, status) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(content, articleId, userId, parent_id || null, author_name || '匿名', status);

  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(comment);
}

// 获取所有评论（管理端）
function getAllComments(req, res) {
  const { page, pageSize, status } = req.query;
  const { offset, limit, page: p, pageSize: ps } = paginate(page, pageSize);

  let where = 'WHERE 1=1';
  const params = [];
  if (status) {
    where += ' AND c.status = ?';
    params.push(status);
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM comments c ${where}`).get(...params).count;

  const comments = db.prepare(`
    SELECT c.*,
      a.title as article_title, a.slug as article_slug,
      CASE WHEN c.user_id IS NOT NULL THEN u.username ELSE c.author_name END as author_display
    FROM comments c
    LEFT JOIN articles a ON c.article_id = a.id
    LEFT JOIN users u ON c.user_id = u.id
    ${where}
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  res.json(paginatedResponse(comments, total, p, ps));
}

// 审核评论
function moderateComment(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: '无效的审核状态' });
  }

  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(id);
  if (!comment) return res.status(404).json({ message: '评论不存在' });

  db.prepare('UPDATE comments SET status = ? WHERE id = ?').run(status, id);
  const updated = db.prepare('SELECT * FROM comments WHERE id = ?').get(id);
  res.json(updated);
}

// 删除评论
function deleteComment(req, res) {
  const { id } = req.params;
  const comment = db.prepare('SELECT id FROM comments WHERE id = ?').get(id);
  if (!comment) return res.status(404).json({ message: '评论不存在' });

  db.prepare('DELETE FROM comments WHERE id = ? OR parent_id = ?').run(id, id);
  res.json({ message: '评论已删除' });
}

module.exports = { getComments, createComment, getAllComments, moderateComment, deleteComment };
