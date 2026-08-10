const { db } = require('../db');
const { slugify } = require('../utils/helpers');

// 获取所有分类
function getCategories(req, res) {
  const categories = db.prepare(`
    SELECT c.*, (SELECT COUNT(*) FROM articles WHERE category_id = c.id AND status = 'published') as article_count
    FROM categories c ORDER BY c.name
  `).all();
  res.json({ data: categories });
}

// 创建分类
function createCategory(req, res) {
  const { name, description } = req.body;
  const slug = slugify(name);

  const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);
  if (existing) {
    return res.status(400).json({ message: '分类已存在' });
  }

  const result = db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)').run(name, slug, description || '');
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(category);
}

// 更新分类
function updateCategory(req, res) {
  const { id } = req.params;
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!category) return res.status(404).json({ message: '分类不存在' });

  const { name, description } = req.body;
  let slug = category.slug;
  if (name && name !== category.name) {
    slug = slugify(name);
  }

  db.prepare('UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?')
    .run(name || category.name, slug, description !== undefined ? description : category.description, id);

  const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  res.json(updated);
}

// 删除分类
function deleteCategory(req, res) {
  const { id } = req.params;
  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(id);
  if (!category) return res.status(404).json({ message: '分类不存在' });

  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  res.json({ message: '分类已删除' });
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
