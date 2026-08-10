const { db } = require('../db');
const { slugify, paginate, paginatedResponse } = require('../utils/helpers');

// 获取文章列表（公开，仅已发布）
function getArticles(req, res) {
  const { page, pageSize, category, tag, search, sort } = req.query;
  const { offset, limit, page: p, pageSize: ps } = paginate(page, pageSize);

  let where = "WHERE a.status = 'published'";
  const params = [];

  if (category) {
    where += ' AND c.slug = ?';
    params.push(category);
  }
  if (tag) {
    where += ' AND a.id IN (SELECT article_id FROM article_tags at2 JOIN tags t2 ON at2.tag_id = t2.id WHERE t2.slug = ?)';
    params.push(tag);
  }
  if (search) {
    where += ' AND (a.title LIKE ? OR a.summary LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const orderBy = sort === 'oldest' ? 'a.created_at ASC' : 'a.created_at DESC';

  const total = db.prepare(`
    SELECT COUNT(DISTINCT a.id) as count FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    ${where}
  `).get(...params).count;

  const articles = db.prepare(`
    SELECT
      a.id, a.title, a.slug, a.summary, a.cover_image, a.status,
      a.is_top, a.view_count, a.created_at, a.updated_at,
      json_object('id', u.id, 'username', u.username, 'avatar', u.avatar) as author,
      CASE WHEN c.id IS NOT NULL THEN json_object('id', c.id, 'name', c.name, 'slug', c.slug) ELSE NULL END as category,
      (SELECT json_group_array(json_object('id', t.id, 'name', t.name, 'slug', t.slug))
       FROM article_tags at2 JOIN tags t ON at2.tag_id = t.id WHERE at2.article_id = a.id) as tags,
      (SELECT COUNT(*) FROM comments WHERE article_id = a.id AND status = 'approved') as comment_count
    FROM articles a
    LEFT JOIN users u ON a.user_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    ${where}
    ORDER BY a.is_top DESC, ${orderBy}
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  // 解析 tags JSON 字符串
  const result = articles.map(a => ({
    ...a,
    tags: JSON.parse(a.tags),
    author: JSON.parse(a.author),
    category: a.category ? JSON.parse(a.category) : null,
  }));

  res.json(paginatedResponse(result, total, p, ps));
}

// 获取所有文章（管理员，包含草稿）
function getAllArticles(req, res) {
  const { page, pageSize, status } = req.query;
  const { offset, limit, page: p, pageSize: ps } = paginate(page, pageSize);

  let where = 'WHERE 1=1';
  const params = [];
  if (status) {
    where += ' AND a.status = ?';
    params.push(status);
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM articles a ${where}`).get(...params).count;

  const articles = db.prepare(`
    SELECT
      a.id, a.title, a.slug, a.summary, a.cover_image, a.status,
      a.is_top, a.view_count, a.created_at, a.updated_at,
      json_object('id', u.id, 'username', u.username) as author,
      CASE WHEN c.id IS NOT NULL THEN json_object('id', c.id, 'name', c.name, 'slug', c.slug) ELSE NULL END as category,
      (SELECT json_group_array(json_object('id', t.id, 'name', t.name, 'slug', t.slug))
       FROM article_tags at2 JOIN tags t ON at2.tag_id = t.id WHERE at2.article_id = a.id) as tags
    FROM articles a
    LEFT JOIN users u ON a.user_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    ${where}
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  const result = articles.map(a => ({
    ...a,
    tags: JSON.parse(a.tags),
    author: JSON.parse(a.author),
    category: a.category ? JSON.parse(a.category) : null,
  }));

  res.json(paginatedResponse(result, total, p, ps));
}

// 获取单篇文章（通过 slug）
function getArticleBySlug(req, res) {
  const { slug } = req.params;

  const article = db.prepare(`
    SELECT
      a.*,
      json_object('id', u.id, 'username', u.username, 'avatar', u.avatar, 'bio', u.bio) as author,
      CASE WHEN c.id IS NOT NULL THEN json_object('id', c.id, 'name', c.name, 'slug', c.slug) ELSE NULL END as category,
      (SELECT json_group_array(json_object('id', t.id, 'name', t.name, 'slug', t.slug))
       FROM article_tags at2 JOIN tags t ON at2.tag_id = t.id WHERE at2.article_id = a.id) as tags
    FROM articles a
    LEFT JOIN users u ON a.user_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.slug = ?
  `).get(slug);

  if (!article) {
    return res.status(404).json({ message: '文章不存在' });
  }

  // 非管理员只能看已发布的文章
  const isAdmin = req.user && req.user.role === 'admin';
  if (article.status !== 'published' && !isAdmin) {
    return res.status(404).json({ message: '文章不存在' });
  }

  // 增加浏览次数
  db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?').run(article.id);

  res.json({
    ...article,
    tags: JSON.parse(article.tags),
    author: JSON.parse(article.author),
    category: article.category ? JSON.parse(article.category) : null,
  });
}

// 获取单篇文章（通过 ID，管理员用）
function getArticleById(req, res) {
  const { id } = req.params;

  const article = db.prepare(`
    SELECT
      a.*,
      json_object('id', u.id, 'username', u.username, 'avatar', u.avatar, 'bio', u.bio) as author,
      CASE WHEN c.id IS NOT NULL THEN json_object('id', c.id, 'name', c.name, 'slug', c.slug) ELSE NULL END as category,
      (SELECT json_group_array(json_object('id', t.id, 'name', t.name, 'slug', t.slug))
       FROM article_tags at2 JOIN tags t ON at2.tag_id = t.id WHERE at2.article_id = a.id) as tags
    FROM articles a
    LEFT JOIN users u ON a.user_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.id = ?
  `).get(id);

  if (!article) {
    return res.status(404).json({ message: '文章不存在' });
  }

  res.json({
    ...article,
    tags: JSON.parse(article.tags),
    author: JSON.parse(article.author),
    category: article.category ? JSON.parse(article.category) : null,
  });
}

// 创建文章
function createArticle(req, res) {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { title, content, summary, cover_image, status, category_id, tag_ids } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: '文章标题不能为空' });
  }

  const slug = slugify(title);

  const existing = db.prepare('SELECT id FROM articles WHERE slug = ?').get(slug);
  if (existing) {
    return res.status(400).json({ message: '文章标题重复，请修改标题' });
  }

  const insertArticle = db.prepare(`
    INSERT INTO articles (title, slug, content, summary, cover_image, status, user_id, category_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTag = db.prepare('INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)');

  const transaction = db.transaction(() => {
    const result = insertArticle.run(
      title, slug, content || '', summary || '', cover_image || '',
      status || 'draft', req.user.id, category_id || null
    );
    const articleId = result.lastInsertRowid;

    if (tag_ids && Array.isArray(tag_ids)) {
      for (const tagId of tag_ids) {
        insertTag.run(articleId, tagId);
      }
    }

    return articleId;
  });

  const articleId = transaction();
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(articleId);
  res.status(201).json(article);
}

// 更新文章
function updateArticle(req, res) {
  const { id } = req.params;
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
  if (!article) {
    return res.status(404).json({ message: '文章不存在' });
  }

  const { title, content, summary, cover_image, status, category_id, tag_ids } = req.body;

  let slug = article.slug;
  if (title && title !== article.title) {
    slug = slugify(title);
  }

  const updateArticleStmt = db.prepare(`
    UPDATE articles SET
      title = ?, slug = ?, content = ?, summary = ?, cover_image = ?,
      status = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const transaction = db.transaction(() => {
    updateArticleStmt.run(
      title || article.title,
      slug,
      content !== undefined ? content : article.content,
      summary !== undefined ? summary : article.summary,
      cover_image !== undefined ? cover_image : article.cover_image,
      status || article.status,
      category_id !== undefined ? category_id : article.category_id,
      id
    );

    if (tag_ids !== undefined) {
      db.prepare('DELETE FROM article_tags WHERE article_id = ?').run(id);
      if (Array.isArray(tag_ids)) {
        const insertTag = db.prepare('INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)');
        for (const tagId of tag_ids) {
          insertTag.run(id, tagId);
        }
      }
    }
  });

  transaction();
  const updated = db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
  res.json(updated);
}

// 删除文章
function deleteArticle(req, res) {
  const { id } = req.params;
  const article = db.prepare('SELECT id FROM articles WHERE id = ?').get(id);
  if (!article) {
    return res.status(404).json({ message: '文章不存在' });
  }

  db.prepare('DELETE FROM articles WHERE id = ?').run(id);
  res.json({ message: '文章已删除' });
}

module.exports = {
  getArticles, getAllArticles, getArticleBySlug, getArticleById,
  createArticle, updateArticle, deleteArticle,
};
