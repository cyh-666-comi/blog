const { db } = require('../db');
const { slugify } = require('../utils/helpers');

async function getCategories(req, res) {
  const cats = await db.prepare('SELECT c.*, (SELECT COUNT(*) FROM articles WHERE category_id = c.id) as article_count FROM categories c ORDER BY c.name').all();
  res.json({ data: cats });
}

async function createCategory(req, res) {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: '分类名不能为空' });
  const slug = slugify(name);
  const existing = await db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);
  if (existing) return res.status(400).json({ message: '分类已存在' });
  await db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)').run(name, slug, description || '');
  const cat = await db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug);
  res.status(201).json(cat);
}

async function updateCategory(req, res) {
  const { id } = req.params;
  const cat = await db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!cat) return res.status(404).json({ message: '分类不存在' });
  const { name, description } = req.body;
  let slug = cat.slug;
  if (name && name !== cat.name) slug = slugify(name);
  await db.prepare('UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?')
    .run(name || cat.name, slug, description !== undefined ? description : cat.description, id);
  const updated = await db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  res.json(updated);
}

async function deleteCategory(req, res) {
  await db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ message: '分类已删除' });
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
