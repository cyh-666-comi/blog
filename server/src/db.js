const { createClient } = require('@libsql/client');

// 如果有 Turso URL 就用云数据库，否则用本地 SQLite
const tursoUrl = process.env.TURSO_DB_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

let client;

if (tursoUrl && tursoToken) {
  console.log('☁️  使用 Turso 云数据库');
  client = createClient({ url: tursoUrl, authToken: tursoToken });
} else {
  console.log('💾 使用本地 SQLite');
  const Database = require('better-sqlite3');
  const path = require('path');
  const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'blog.db');
  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  client = sqlite;
  client._local = true;
}

// 转为 better-sqlite3 兼容接口
function wrap(client) {
  if (client._local) {
    // 本地 SQLite，直接返回原始对象
    return client;
  }
  // Turso: 包装成兼容接口
  return {
    _turso: true,
    _client: client,
    prepare(sql) {
      return {
        async get(...args) {
          const r = await client.execute({ sql, args });
          return r.rows[0] || null;
        },
        async all(...args) {
          const r = await client.execute({ sql, args });
          return r.rows;
        },
        async run(...args) {
          await client.execute({ sql, args });
          return { lastInsertRowid: null };
        },
      };
    },
    exec(sql) {
      // 同步执行多条 SQL（仅用于建表）
      // Turso 需要逐条执行
      return {
        execSync() {
          const stmts = sql.split(';').filter(s => s.trim());
          (async () => {
            for (const s of stmts) {
              try { await client.execute(s.trim() + ';'); } catch (e) { /* 忽略重复建表错误 */ }
            }
          })();
        },
      };
    },
    async transaction(fn) {
      // Turso 简单事务：直接执行函数
      // 注意：这不支持真正的回滚
      const txnDb = {
        prepare(sql) {
          return {
            run(...args) { return client.execute({ sql, args }); },
            get(...args) { return client.execute({ sql, args }).then(r => r.rows[0] || null); },
          };
        },
      };
      return await fn(txnDb);
    },
  };
}

const db = wrap(client);

// 初始化数据库表
async function initDatabase() {
  const createSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      avatar TEXT DEFAULT '',
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      bio TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL DEFAULT '',
      summary TEXT DEFAULT '',
      cover_image TEXT DEFAULT '',
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
      is_top INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      user_id INTEGER NOT NULL,
      category_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS article_tags (
      article_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (article_id, tag_id),
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      article_id INTEGER NOT NULL,
      user_id INTEGER,
      parent_id INTEGER DEFAULT NULL,
      author_name TEXT DEFAULT '',
      status TEXT DEFAULT 'approved' CHECK(status IN ('pending', 'approved', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_name TEXT NOT NULL DEFAULT '匿名',
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  if (tursoUrl) {
    const stmts = createSQL.split(';').filter(s => s.trim());
    for (const s of stmts) {
      try { await client.execute(s.trim() + ';'); } catch (e) { /* 忽略重复建表 */ }
    }
  } else {
    client.exec(createSQL);
  }

  // 创建默认用户
  const bcrypt = require('bcryptjs');
  try {
    const cyhExists = await db.prepare('SELECT id FROM users WHERE username = ?').get('cyh');
    if (!cyhExists) {
      const hash = bcrypt.hashSync('050728', 10);
      await db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run('cyh', 'cyh@diary.com', hash, 'admin');
      console.log('✓ 用户: cyh / 050728');
    }
    const frzExists = await db.prepare('SELECT id FROM users WHERE username = ?').get('frz');
    if (!frzExists) {
      const hash = bcrypt.hashSync('040216', 10);
      await db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run('frz', 'frz@diary.com', hash, 'admin');
      console.log('✓ 用户: frz / 040216');
    }
  } catch (e) { console.log('用户初始化:', e.message); }
}

module.exports = { db, initDatabase };
