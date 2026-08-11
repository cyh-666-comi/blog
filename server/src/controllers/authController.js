const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');

async function register(req, res) {
  const { username, email, password } = req.body;
  const existingUser = await db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
  if (existingUser) return res.status(400).json({ message: '用户名或邮箱已被注册' });

  const hashedPassword = bcrypt.hashSync(password, 10);
  await db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, hashedPassword);

  const user = await db.prepare('SELECT id, username, email, role, avatar, bio, created_at FROM users WHERE username = ?').get(username);
  const token = jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  res.status(201).json({ user, token });
}

async function login(req, res) {
  const { username, password } = req.body;
  const user = await db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username);
  if (!user) return res.status(401).json({ message: '用户名或密码错误' });

  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) return res.status(401).json({ message: '用户名或密码错误' });

  const token = jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  const { password: _, ...u } = user;
  res.json({ user: u, token });
}

async function getMe(req, res) {
  const user = await db.prepare('SELECT id, username, email, role, avatar, bio, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: '用户不存在' });
  res.json({ user });
}

async function updateProfile(req, res) {
  const { username, email, bio, avatar } = req.body;
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: '用户不存在' });

  if (username && username !== user.username) {
    const e = await db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, req.user.id);
    if (e) return res.status(400).json({ message: '用户名已被使用' });
  }
  if (email && email !== user.email) {
    const e = await db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.user.id);
    if (e) return res.status(400).json({ message: '邮箱已被使用' });
  }

  await db.prepare('UPDATE users SET username = ?, email = ?, bio = ?, avatar = ? WHERE id = ?')
    .run(username || user.username, email || user.email, bio !== undefined ? bio : user.bio, avatar !== undefined ? avatar : user.avatar, req.user.id);

  const updated = await db.prepare('SELECT id, username, email, role, avatar, bio, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json({ user: updated });
}

module.exports = { register, login, getMe, updateProfile };
