const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");
const db = new Database("database.db");

// 生成正确的密码哈希 (admin123)
const passwordHash = bcrypt.hashSync("admin123", 10);
console.log("Password hash:", passwordHash);

// 插入管理员用户
const insertUser = db.prepare(`
  INSERT INTO users (id, email, name, password, role, bio, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`);
insertUser.run("admin123", "admin@example.com", "Admin", passwordHash, "ADMIN", "网站管理员");

// 插入分类
const insertCategory = db.prepare(`
  INSERT INTO categories (id, name, slug, description, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
`);
insertCategory.run("cat1", "技术", "tech", "技术相关文章");
insertCategory.run("cat2", "生活", "life", "生活分享");
insertCategory.run("cat3", "教程", "tutorial", "教程文章");

// 插入标签
const insertTag = db.prepare(`
  INSERT INTO tags (id, name, slug, createdAt, updatedAt)
  VALUES (?, ?, ?, datetime('now'), datetime('now'))
`);
insertTag.run("tag1", "Vue", "vue");
insertTag.run("tag2", "Nuxt", "nuxt");
insertTag.run("tag3", "TypeScript", "typescript");
insertTag.run("tag4", "JavaScript", "javascript");

// 插入测试文章
const insertPost = db.prepare(`
  INSERT INTO posts (id, title, slug, content, excerpt, published, publishedAt, authorId, categoryId, views, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, 1, datetime('now'), ?, ?, 0, datetime('now'), datetime('now'))
`);
insertPost.run("post1", "欢迎来到我的博客", "welcome-to-my-blog", "# 欢迎\n\n这是我的第一篇博客文章。感谢你的访问！", "欢迎来到我的博客", "admin123", "cat1");
insertPost.run("post2", "Nuxt 4 入门教程", "nuxt-4-getting-started", "# Nuxt 4 入门\n\nNuxt 4 是一个强大的 Vue 框架...", "学习 Nuxt 4 的基础知识", "admin123", "cat3");

// 添加文章标签关联
const insertPostTag = db.prepare(`INSERT INTO post_tags (postId, tagId) VALUES (?, ?)`);
insertPostTag.run("post2", "tag1");
insertPostTag.run("post2", "tag2");

// 验证数据
console.log("\n数据插入完成：");
console.log("Users:", db.prepare("SELECT COUNT(*) as count FROM users").get());
console.log("Posts:", db.prepare("SELECT COUNT(*) as count FROM posts").get());
console.log("Categories:", db.prepare("SELECT COUNT(*) as count FROM categories").get());
console.log("Tags:", db.prepare("SELECT COUNT(*) as count FROM tags").get());

db.close();
