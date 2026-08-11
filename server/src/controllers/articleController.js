const { db } = require('../db');
const { slugify, paginate, paginatedResponse } = require('../utils/helpers');

// 公开文章列表
async function getArticles(req, res) {
  const { page, pageSize, category, tag, search, sort } = req.query;
  const { offset, limit, page: p, pageSize: ps } = paginate(page, pageSize);

  let where = "WHERE a.status = 'published'";
  const params = [];

  if (category) { where += ' AND c.slug = ?'; params.push(category); }
  if (search) { where += ' AND (a.title LIKE ? OR a.summary LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  const orderBy = sort === 'oldest' ? 'a.created_at ASC' : 'a.created_at DESC';

  const countRow = await db.prepare(`SELECT COUNT(DISTINCT a.id) as count FROM articles a LEFT JOIN categories c ON a.category_id = c.id ${where}`).get(...params);
  const total = countRow?.count || 0;

  const articles = await db.prepare(`
    SELECT a.id, a.title, a.slug, a.summary, a.cover_image, a.status, a.is_top, a.view_count, a.created_at, a.updated_at,
      json_object('id',u.id,'username',u.username,'avatar',u.avatar) as author,
      CASE WHEN c.id IS NOT NULL THEN json_object('id',c.id,'name',c.name,'slug',c.slug) ELSE NULL END as category,
      (SELECT COUNT(*) FROM comments WHERE article_id = a.id AND status = 'approved') as comment_count
    FROM articles a LEFT JOIN users u ON a.user_id = u.id LEFT JOIN categories c ON a.category_id = c.id
    ${where} ORDER BY a.is_top DESC, ${orderBy} LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  const result = articles.map(a => {
    try {
      return { ...a, author: JSON.parse(a.author), category: a.category ? JSON.parse(a.category) : null, tags: [] };
    } catch { return { ...a, author: {}, category: null, tags: [] }; }
  });

  res.json(paginatedResponse(result, total, p, ps));
}

// 管理员文章列表
async function getAllArticles(req, res) {
  const { page, pageSize, status } = req.query;
  const { offset, limit, page: p, pageSize: ps } = paginate(page, pageSize);

  let where = 'WHERE 1=1';
  const params = [];
  if (status) { where += ' AND a.status = ?'; params.push(status); }

  const countRow = await db.prepare(`SELECT COUNT(*) as count FROM articles a ${where}`).get(...params);
  const total = countRow?.count || 0;

  const articles = await db.prepare(`
    SELECT a.id, a.title, a.slug, a.summary, a.cover_image, a.status, a.is_top, a.view_count, a.created_at, a.updated_at,
      json_object('id',u.id,'username',u.username) as author,
      CASE WHEN c.id IS NOT NULL THEN json_object('id',c.id,'name',c.name,'slug',c.slug) ELSE NULL END as category
    FROM articles a LEFT JOIN users u ON a.user_id = u.id LEFT JOIN categories c ON a.category_id = c.id
    ${where} ORDER BY a.created_at DESC LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  const result = articles.map(a => {
    try { return { ...a, author: JSON.parse(a.author), category: a.category ? JSON.parse(a.category) : null, tags: [] }; }
    catch { return { ...a, author: {}, category: null, tags: [] }; }
  });

  res.json(paginatedResponse(result, total, p, ps));
}

// 通过 slug 获取文章
async function getArticleBySlug(req, res) {
  const { slug } = req.params;

  const article = await db.prepare(`
    SELECT a.*, json_object('id',u.id,'username',u.username,'avatar',u.avatar,'bio',u.bio) as author,
      CASE WHEN c.id IS NOT NULL THEN json_object('id',c.id,'name',c.name,'slug',c.slug) ELSE NULL END as category
    FROM articles a LEFT JOIN users u ON a.user_id = u.id LEFT JOIN categories c ON a.category_id = c.id WHERE a.slug = ?
  `).get(slug);

  if (!article) return res.status(404).json({ message: '文章不存在' });

  if (article.status !== 'published') {
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin) return res.status(404).json({ message: '文章不存在' });
  }

  await db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?').run(article.id);

  try {
    article.author = JSON.parse(article.author);
    article.category = article.category ? JSON.parse(article.category) : null;
  } catch { article.author = {}; article.category = null; }

  res.json(article);
}

// 通过 ID 获取（管理员）
async function getArticleById(req, res) {
  const { id } = req.params;
  const article = await db.prepare(`
    SELECT a.*, json_object('id',u.id,'username',u.username,'avatar',u.avatar,'bio',u.bio) as author,
      CASE WHEN c.id IS NOT NULL THEN json_object('id',c.id,'name',c.name,'slug',c.slug) ELSE NULL END as category
    FROM articles a LEFT JOIN users u ON a.user_id = u.id LEFT JOIN categories c ON a.category_id = c.id WHERE a.id = ?
  `).get(id);

  if (!article) return res.status(404).json({ message: '文章不存在' });

  try { article.author = JSON.parse(article.author); article.category = article.category ? JSON.parse(article.category) : null; }
  catch { article.author = {}; article.category = null; }

  res.json(article);
}

// 创建文章
async function createArticle(req, res) {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { title, content, summary, cover_image, status } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ message: '文章标题不能为空' });

  const slug = slugify(title);
  const existing = await db.prepare('SELECT id FROM articles WHERE slug = ?').get(slug);
  if (existing) return res.status(400).json({ message: '文章标题重复，请修改标题' });

  await db.prepare('INSERT INTO articles (title, slug, content, summary, cover_image, status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(title, slug, content || '', summary || '', cover_image || '', status || 'draft', req.user.id);

  // 获取新插入的文章 ID
  const created = await db.prepare('SELECT id FROM articles WHERE slug = ?').get(slug);
  const article = await db.prepare('SELECT * FROM articles WHERE id = ?').get(created.id);
  res.status(201).json(article);
}

// 更新文章
async function updateArticle(req, res) {
  const { id } = req.params;
  const article = await db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
  if (!article) return res.status(404).json({ message: '文章不存在' });

  const { title, content, summary, cover_image, status } = req.body;
  let slug = article.slug;
  if (title && title !== article.title) slug = slugify(title);

  await db.prepare(`UPDATE articles SET title = ?, slug = ?, content = ?, summary = ?, cover_image = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(title || article.title, slug, content !== undefined ? content : article.content, summary !== undefined ? summary : article.summary,
      cover_image !== undefined ? cover_image : article.cover_image, status || article.status, id);

  const updated = await db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
  res.json(updated);
}

// 删除文章
async function deleteArticle(req, res) {
  const { id } = req.params;
  const article = await db.prepare('SELECT id FROM articles WHERE id = ?').get(id);
  if (!article) return res.status(404).json({ message: '文章不存在' });
  await db.prepare('DELETE FROM articles WHERE id = ?').run(id);
  res.json({ message: '文章已删除' });
}

module.exports = { getArticles, getAllArticles, getArticleBySlug, getArticleById, createArticle, updateArticle, deleteArticle };
