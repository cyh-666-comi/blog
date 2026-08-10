const { db } = require('../db');
const { slugify } = require('../utils/helpers');

// 获取所有标签
function getTags(req, res) {
  const tags = db.prepare(`
    SELECT t.*, (SELECT COUNT(*) FROM article_tags WHERE tag_id = t.id) as article_count
    FROM tags t ORDER BY t.name
  `).all();
  res.json({ data: tags });
}

// 创建标签
function createTag(req, res) {
  const { name } = req.body;
  const slug = slugify(name);

  const existing = db.prepare('SELECT id FROM tags WHERE slug = ?').get(slug);
  if (existing) {
    return res.status(400).json({ message: '标签已存在' });
  }

  const result = db.prepare('INSERT INTO tags (name, slug) VALUES (?, ?)').run(name, slug);
  const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(tag);
}

// 批量创建标签
function createTagsBatch(req, res) {
  const { names } = req.body;
  if (!Array.isArray(names)) {
    return res.status(400).json({ message: 'names 必须是字符串数组' });
  }

  const insert = db.prepare('INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)');
  const results = [];

  const transaction = db.transaction(() => {
    for (const name of names) {
      const slug = slugify(name);
      insert.run(name, slug);
      const tag = db.prepare('SELECT * FROM tags WHERE slug = ?').get(slug);
      if (tag) results.push(tag);
    }
  });

  transaction();
  res.status(201).json({ data: results });
}

// 更新标签
function updateTag(req, res) {
  const { id } = req.params;
  const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
  if (!tag) return res.status(404).json({ message: '标签不存在' });

  const { name } = req.body;
  let slug = tag.slug;
  if (name && name !== tag.name) {
    slug = slugify(name);
  }

  db.prepare('UPDATE tags SET name = ?, slug = ? WHERE id = ?').run(name || tag.name, slug, id);
  const updated = db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
  res.json(updated);
}

// 删除标签
function deleteTag(req, res) {
  const { id } = req.params;
  const tag = db.prepare('SELECT id FROM tags WHERE id = ?').get(id);
  if (!tag) return res.status(404).json({ message: '标签不存在' });

  db.prepare('DELETE FROM tags WHERE id = ?').run(id);
  res.json({ message: '标签已删除' });
}

module.exports = { getTags, createTag, createTagsBatch, updateTag, deleteTag };
