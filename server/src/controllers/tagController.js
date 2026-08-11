const { db } = require('../db');
const { slugify } = require('../utils/helpers');

async function getTags(req, res) {
  const tags = await db.prepare('SELECT t.*, (SELECT COUNT(*) FROM article_tags WHERE tag_id = t.id) as article_count FROM tags t ORDER BY t.name').all();
  res.json({ data: tags });
}

async function createTag(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: '标签名不能为空' });
  const slug = slugify(name);
  await db.prepare('INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)').run(name, slug);
  const tag = await db.prepare('SELECT * FROM tags WHERE slug = ?').get(slug);
  res.status(201).json(tag);
}

async function createTagsBatch(req, res) {
  const { names } = req.body;
  if (!Array.isArray(names)) return res.status(400).json({ message: 'names 必须是字符串数组' });
  for (const name of names) {
    if (name.trim()) {
      await db.prepare('INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)').run(name.trim(), slugify(name.trim()));
    }
  }
  const tags = await db.prepare('SELECT * FROM tags ORDER BY name').all();
  res.status(201).json({ data: tags });
}

async function updateTag(req, res) {
  const { id } = req.params;
  const tag = await db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
  if (!tag) return res.status(404).json({ message: '标签不存在' });
  const { name } = req.body;
  let slug = tag.slug;
  if (name && name !== tag.name) slug = slugify(name);
  await db.prepare('UPDATE tags SET name = ?, slug = ? WHERE id = ?').run(name || tag.name, slug, id);
  const updated = await db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
  res.json(updated);
}

async function deleteTag(req, res) {
  await db.prepare('DELETE FROM tags WHERE id = ?').run(req.params.id);
  res.json({ message: '标签已删除' });
}

module.exports = { getTags, createTag, createTagsBatch, updateTag, deleteTag };
