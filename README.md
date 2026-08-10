# 📝 个人博客系统

基于 **React + Express + SQLite** 的全栈博客系统，包含前台展示和后台管理。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + Vite + Tailwind CSS + React Router + Axios |
| 后端 | Node.js + Express + better-sqlite3 |
| 认证 | JWT (JSON Web Token) |
| 数据库 | SQLite (零配置，本地文件存储) |

## 功能特性

### 前台博客
- 📄 文章列表（分页、分类筛选、标签筛选、搜索）
- 📖 文章详情（富文本渲染、阅读计数）
- 💬 评论系统（支持回复）
- 📁 分类浏览
- 🏷️ 标签浏览
- 📱 响应式设计（支持手机/平板/桌面）

### 后台管理
- 📊 仪表盘（数据统计）
- ✏️ 文章编辑器（创建/编辑，支持 HTML，支持图片上传）
- 📄 文章管理（列表、筛选、删除）
- 📁 分类管理（增删改查）
- 🏷️ 标签管理（单个/批量创建）
- 💬 评论管理（审核、删除）

## 快速开始

### 1. 启动后端

```bash
cd server
npm install
npm run dev
```

后端运行在 http://localhost:3000

### 2. 启动前端

```bash
cd client
npm install
npm run dev
```

前端运行在 http://localhost:5173

### 3. Windows 一键启动

双击 `start.bat`

## 默认管理员账号

- 用户名: `admin`
- 密码: `admin123`

⚠️ **首次使用请立即修改密码！**

## 项目结构

```
博客/
├── server/                 # 后端
│   ├── src/
│   │   ├── index.js        # 入口
│   │   ├── db.js           # 数据库连接与初始化
│   │   ├── middleware/      # 中间件（认证、错误处理）
│   │   ├── routes/         # 路由
│   │   ├── controllers/    # 控制器（业务逻辑）
│   │   └── utils/          # 工具函数
│   ├── uploads/            # 上传文件目录
│   └── blog.db             # SQLite 数据库文件（自动创建）
├── client/                 # 前端
│   ├── src/
│   │   ├── api/            # API 接口封装
│   │   ├── components/     # 公共组件
│   │   ├── context/        # React Context（认证状态）
│   │   ├── pages/          # 页面
│   │   │   ├── public/     # 前台页面
│   │   │   └── admin/      # 后台页面
│   │   └── index.css       # Tailwind + 富文本样式
│   └── vite.config.js      # Vite 配置（含代理）
├── start.bat               # Windows 一键启动脚本
└── README.md
```

## API 接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | ❌ |
| POST | /api/auth/login | 用户登录 | ❌ |
| GET | /api/auth/me | 获取当前用户 | ✅ |
| GET | /api/articles | 文章列表 | ❌ |
| GET | /api/articles/:slug | 文章详情 | ❌ |
| POST | /api/articles | 创建文章 | ✅ Admin |
| PUT | /api/articles/:id | 更新文章 | ✅ Admin |
| DELETE | /api/articles/:id | 删除文章 | ✅ Admin |
| GET | /api/categories | 分类列表 | ❌ |
| POST | /api/categories | 创建分类 | ✅ Admin |
| PUT | /api/categories/:id | 更新分类 | ✅ Admin |
| DELETE | /api/categories/:id | 删除分类 | ✅ Admin |
| GET | /api/tags | 标签列表 | ❌ |
| POST | /api/tags | 创建标签 | ✅ Admin |
| POST | /api/tags/batch | 批量创建标签 | ✅ Admin |
| GET | /api/comments/article/:id | 文章评论 | ❌ |
| POST | /api/comments/article/:id | 发表评论 | ❌ |
| GET | /api/comments/admin/all | 所有评论 | ✅ Admin |
| PUT | /api/comments/:id/moderate | 审核评论 | ✅ Admin |
| POST | /api/upload | 上传图片 | ✅ Admin |

## 部署

将 `server/.env` 中的 `JWT_SECRET` 改为复杂随机字符串后，可使用 Docker 部署：

```dockerfile
# 示例 Dockerfile（待补充）
```

## License

MIT
